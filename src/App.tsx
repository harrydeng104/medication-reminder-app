import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'medication-reminder.openings'

type RecognitionResultEvent = {
  results: {
    length: number
    [index: number]: {
      [index: number]: { transcript: string }
    }
  }
}

type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onspeechstart: (() => void) | null
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type RecognitionConstructor = new () => Recognition

type Medication = {
  phrase: string
  time: string
}

const MEDICATION_KEY = 'medication-reminder.medication'

function normalizeAnswer(text: string) {
  return text.normalize('NFKC').replace(/[\s\p{P}]/gu, '').toLowerCase()
}

function classifyAnswer(
  transcript: string,
  medicationPhrase: string,
): 'correct' | 'help' | 'unmatched' {
  const answer = normalizeAnswer(transcript)
  const expected = normalizeAnswer(medicationPhrase)
  const helpExpressions = [
    '不知道', '不记得', '忘了', '想不起来',
    '告诉我', '帮帮我', '需要帮助', '什么药',
  ]

  if (helpExpressions.some((expression) => answer.includes(expression))) {
    return 'help'
  }
  return expected && answer.includes(expected) ? 'correct' : 'unmatched'
}

function loadMedication(): { medication: Medication; error: string } {
  const empty = { phrase: '', time: '' }

  try {
    const saved = localStorage.getItem(MEDICATION_KEY)

    if (saved === null) {
      return { medication: empty, error: '' }
    }

    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('phrase' in parsed) ||
      typeof parsed.phrase !== 'string' ||
      !parsed.phrase.trim() ||
      !('time' in parsed) ||
      typeof parsed.time !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(parsed.time)
    ) {
      throw new Error('Invalid medication configuration')
    }

    return { medication: parsed as Medication, error: '' }
  } catch {
    return {
      medication: empty,
      error: 'Medication configuration could not be loaded.',
    }
  }
}

function loadHistory(): { timestamps: string[]; error: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === null) {
      return { timestamps: [], error: '' }
    }

    const parsed: unknown = JSON.parse(saved)

    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (value) =>
          typeof value === 'string' &&
          Number.isFinite(Date.parse(value)),
      )
    ) {
      throw new Error('Invalid history')
    }

    return { timestamps: parsed, error: '' }
  } catch {
    return {
      timestamps: [],
      error: 'History could not be loaded. Reload before adding openings.',
    }
  }
}

function App() {
  const [initialMedication] = useState(loadMedication)
  const [medication, setMedication] = useState(initialMedication.medication)
  const [phrase, setPhrase] = useState(initialMedication.medication.phrase)
  const [time, setTime] = useState(initialMedication.medication.time)
  const [medicationMessage, setMedicationMessage] = useState('')
  const [medicationError, setMedicationError] = useState(initialMedication.error)
  const [initialHistory] = useState(loadHistory)
  const [timestamps, setTimestamps] = useState(initialHistory.timestamps)
  const [error, setError] = useState(initialHistory.error)
  const [reminderStarted, setReminderStarted] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [spokenEnglish, setSpokenEnglish] = useState('')
  const [answerFeedback, setAnswerFeedback] = useState('')
  const incorrectAttempts = useRef(0)
  const shouldEvaluateAnswer = useRef(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef<Recognition | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognitionError, setRecognitionError] = useState('')
  const [listeningStatus, setListeningStatus] = useState('')
  const clearListeningTimers = useRef<() => void>(() => {})
  const finishListeningRef = useRef<((message: string) => void) | null>(null)

  useEffect(() => {
    return () => {
      clearListeningTimers.current()
      finishListeningRef.current = null
      const recognition = recognitionRef.current
      if (recognition) {
        recognition.onstart = null
        recognition.onspeechstart = null
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.stop()
      }
    }
  }, [])

  function startListening() {
    if (recognitionRef.current) return

    const speechWindow = window as Window & {
      SpeechRecognition?: RecognitionConstructor
      webkitSpeechRecognition?: RecognitionConstructor
    }
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition

    setRecognitionError('')
    if (!SpeechRecognition) {
      setListeningStatus('')
      setRecognitionError(
        '此浏览器不支持语音识别，请使用“查看答案”。 / Speech recognition is unavailable. Use Show answer.',
      )
      return
    }

    window.speechSynthesis?.cancel()
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = false

    let sessionText = ''
    let recognitionFailed = false
    shouldEvaluateAnswer.current = true
    setTranscript('')
    setAnswerFeedback('')
    let endingMessage = '聆听已结束，您可以继续回答。 / Listening ended. You can continue.'
    let noSpeechTimer: number | undefined
    let maximumTimer: number | undefined

    function clearTimers() {
      window.clearTimeout(noSpeechTimer)
      window.clearTimeout(maximumTimer)
    }

    function finish(message: string) {
      endingMessage = message
      clearTimers()
      setListeningStatus('正在结束聆听… / Finishing…')
      recognition.stop()
    }

    clearListeningTimers.current = clearTimers
    finishListeningRef.current = finish

    recognition.onstart = () => {
      setListeningStatus('正在聆听… / Listening…')
      noSpeechTimer = window.setTimeout(() => {
        finish('未检测到语音，请再试一次。 / No speech detected. Please try again.')
      }, 5_000)
      maximumTimer = window.setTimeout(() => {
        finish('已达到一分钟。您可以继续回答。 / One-minute limit reached. You can continue.')
      }, 60_000)
    }
    recognition.onspeechstart = () => {
      window.clearTimeout(noSpeechTimer)
    }
    recognition.onresult = (event) => {
      window.clearTimeout(noSpeechTimer)
      const phrases: string[] = []
      for (let index = 0; index < event.results.length; index++) {
        phrases.push(event.results[index][0].transcript)
      }
      sessionText = phrases.filter(Boolean).join(' ')
      setTranscript(sessionText)
    }
    recognition.onerror = (event) => {
      recognitionFailed = true
      clearTimers()
      endingMessage = ''
      setListeningStatus('')
      if (event.error === 'not-allowed') {
        setRecognitionError(
          '麦克风或语音权限被拒绝，请使用“查看答案”。 / Microphone or speech access denied. Use Show answer.',
        )
      } else if (event.error === 'no-speech') {
        setRecognitionError('未检测到语音，请再试一次。 / No speech detected. Please try again.')
      } else {
        setRecognitionError(
          `语音识别失败，请再试一次。 / Speech recognition failed (${event.error}). Please try again.`,
        )
      }
    }
    recognition.onend = () => {
      clearTimers()
      recognitionRef.current = null
      finishListeningRef.current = null
      setListening(false)
      setListeningStatus(endingMessage)
      if (shouldEvaluateAnswer.current && !recognitionFailed) {
        shouldEvaluateAnswer.current = false
        evaluateAnswer(sessionText)
      }
    }
    recognitionRef.current = recognition
    setListening(true)
    setListeningStatus('正在开启麦克风… / Starting microphone…')

    try {
      recognition.start()
    } catch {
      shouldEvaluateAnswer.current = false
      clearTimers()
      recognitionRef.current = null
      finishListeningRef.current = null
      setListening(false)
      setListeningStatus('')
      setRecognitionError('无法开始聆听，请再试一次。 / Could not start listening. Please try again.')
    }
  }

  function stopListening() {
    finishListeningRef.current?.('回答已结束。 / Answer finished.')
  }

  const reminderPrompt = '现在该吃药了。你记得该吃什么药吗？'

  function speak(text: string, english: string) {
    shouldEvaluateAnswer.current = false
    if (recognitionRef.current) stopListening()
    setSpokenText(text)
    setSpokenEnglish(english)
    setSpeechError('')

    if (
      !('speechSynthesis' in window) ||
      !('SpeechSynthesisUtterance' in window)
    ) {
      setSpeechError('无法播放语音，请阅读文字。 / Speech playback is unavailable. Please read the text.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        setSpeechError('语音播放失败，请阅读文字。 / Speech playback failed. Please read the text.')
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  function startReminder() {
    incorrectAttempts.current = 0
    setTranscript('')
    setAnswerFeedback('')
    setRecognitionError('')
    setReminderStarted(true)
    speak(reminderPrompt, 'It is time for your medication. Do you remember which medicine?')
  }

  function showAnswer() {
    incorrectAttempts.current = 0
    speak(`现在该吃的是：${medication.phrase}。`, `The scheduled medicine is: ${medication.phrase}.`)
  }

  function evaluateAnswer(text: string) {
    if (!text.trim()) {
      setAnswerFeedback('没有识别到回答，请再试一次。 / No answer recognized. Please try again.')
      return
    }

    const result = classifyAnswer(text, medication.phrase)
    if (result === 'help') {
      setAnswerFeedback('下面是本次安排的药品。 / Here is the scheduled medicine.')
      showAnswer()
    } else if (result === 'correct') {
      incorrectAttempts.current = 0
      setAnswerFeedback('回答正确。 / Correct answer.')
      speak('对，这是本次安排的药。', 'Yes, that is the scheduled medicine.')
    } else {
      incorrectAttempts.current += 1
      if (incorrectAttempts.current === 1) {
        setAnswerFeedback('未能匹配保存的药品名称，请再试一次。 / Could not match the saved medication phrase. Please try once more.')
        speak('请再想一想，现在该吃什么药？', 'Please think again. Which medicine is scheduled now?')
      } else {
        setAnswerFeedback('下面是本次安排的药品。 / Here is the scheduled medicine.')
        showAnswer()
      }
    }
  }

  function saveMedication(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextMedication = { phrase: phrase.trim(), time }

    if (!nextMedication.phrase) {
      setMedicationError('Enter a medication phrase.')
      setMedicationMessage('')
      return
    }

    try {
      localStorage.setItem(MEDICATION_KEY, JSON.stringify(nextMedication))
      setMedication(nextMedication)
      setMedicationError('')
      setMedicationMessage('Medication saved.')
    } catch {
      setMedicationError('Medication could not be saved. Please try again.')
      setMedicationMessage('')
    }
  }

  function simulateOpening() {
    const nextTimestamps = [
      new Date().toISOString(),
      ...timestamps,
    ]

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTimestamps))
      setTimestamps(nextTimestamps)
      setError('')
    } catch {
      setError('The opening could not be saved. Please try again.')
    }
  }

  return (
    <main>
      <h1>Medication Reminder</h1>

      <section aria-labelledby="medication-heading">
        <h2 id="medication-heading">Medication setup</h2>

        <form onSubmit={saveMedication}>
          <p>
            <label>
              Medication phrase
              <br />
              <input
                value={phrase}
                onChange={(event) => {
                  setPhrase(event.target.value)
                  setMedicationMessage('')
                }}
                placeholder="药"
                required
              />
            </label>
          </p>

          <p>
            <label>
              Daily reminder time
              <br />
              <input
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value)
                  setMedicationMessage('')
                }}
                required
              />
            </label>
          </p>

          <button type="submit" disabled={Boolean(initialMedication.error)}>
            Save medication
          </button>
        </form>

        {medicationError && <p role="alert">{medicationError}</p>}
        {medicationMessage && <p role="status">{medicationMessage}</p>}

        {medication.phrase && (
          <p>
            Saved: {medication.phrase} — {medication.time} daily
          </p>
        )}
      </section>

      <section aria-labelledby="reminder-heading">
        <h2 id="reminder-heading">用药提醒 / Reminder</h2>

        <button
          type="button"
          onClick={startReminder}
          disabled={!medication.phrase}
        >
          开始提醒 / Start reminder
        </button>

        {!medication.phrase && <p>请先保存药品名称。 / Save a medication phrase first.</p>}

        {reminderStarted && (
          <>
            <p lang="zh-CN" role="status">
              {spokenText}
            </p>
            <p lang="en">
              {spokenEnglish}
            </p>

            <button type="button" onClick={() => speak(reminderPrompt, 'It is time for your medication. Do you remember which medicine?')}>
              重复提醒 / Repeat prompt
            </button>

            {' '}

            <button type="button" onClick={showAnswer}>
              查看答案 / Show answer
            </button>

            <p>
              <button type="button" onClick={startListening} disabled={listening}>
                开始回答 / Answer aloud
              </button>
              {' '}
              <button type="button" onClick={stopListening} disabled={!listening}>
                说完了 / Done speaking
              </button>
            </p>

            <p role="status">
              {listening && '● '}
              {listeningStatus}
            </p>
            {transcript && (
              <p role="status">
                识别结果 / Recognized: <span lang="zh-CN">{transcript}</span>
              </p>
            )}
            {recognitionError && <p role="alert">{recognitionError}</p>}
            {answerFeedback && <p role="status">{answerFeedback}</p>}
          </>
        )}

        {speechError && <p role="alert">{speechError}</p>}
      </section>

      <button
        type="button"
        onClick={simulateOpening}
        disabled={Boolean(initialHistory.error)}
      >
        Simulate box opening
      </button>

      {error && <p role="alert">{error}</p>}

      <h2>Box-opening history</h2>

      {timestamps.length === 0 ? (
        <p>No opening events to display.</p>
      ) : (
        <ul>
          {timestamps.map((timestamp, index) => (
            <li key={index}>
              <time dateTime={timestamp}>
                {new Date(timestamp).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
