class AIService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  isUsableApiKey(apiKey) {
    if (!apiKey) return false;
    const trimmed = String(apiKey).trim();
    if (!trimmed) return false;
    if (trimmed.includes('placeholder')) return false;
    if (trimmed.includes('your_openai_api_key_here')) return false;
    return true;
  }

  async initializeAI() {
    if (this.initialized) {
      return true;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!this.isUsableApiKey(apiKey)) {
      this.client = null;
      this.initialized = true;
      return true;
    }

    try {
      // Lazy load keeps this module usable even when dependencies are not installed yet.
      const OpenAI = require('openai');
      this.client = new OpenAI({ apiKey });
      this.initialized = true;
      return true;
    } catch (error) {
      this.client = null;
      this.initialized = true;
      return true;
    }
  }

  async analyzeCode(code, language, problemContext) {
    const safeCode = typeof code === 'string' ? code : '';
    const safeLanguage = (language || 'javascript').toString().toLowerCase();

    const syntaxErrors = [];
    if (!safeCode.trim()) {
      syntaxErrors.push('No code provided for analysis');
    }

    const hasTodo = safeCode.toLowerCase().includes('todo');
    const suggestions = [];
    if (hasTodo) suggestions.push('Resolve TODO markers before final submission.');
    if (safeCode.length < 30) suggestions.push('Add more implementation detail to complete the solution.');

    return {
      syntaxErrors,
      logicIssues: [],
      suggestions,
      hints: [
        'Test edge cases like empty input, single-element input, and duplicates.',
        'Verify time and space complexity against expected constraints.'
      ],
      score: safeCode.trim() ? 60 : 0,
      feedback: `Basic ${safeLanguage} analysis completed${problemContext ? ' with problem context' : ''}.`
    };
  }

  async generateHint(code, language, problemContext, previousHints) {
    const priorCount = Array.isArray(previousHints) ? previousHints.length : 0;
    if (priorCount === 0) {
      return 'Start by identifying the core input/output transformation and writing the simplest correct approach.';
    }
    if (priorCount === 1) {
      return 'Consider whether a hash map or two-pointer technique can reduce nested loops.';
    }
    return 'Trace your logic on a small custom test case and compare each step to the expected output.';
  }

  async generateContent(prompt) {
    const defaultPayload = {
      testCases: [
        {
          input: '[]',
          expectedOutput: '[]',
          explanation: 'Handles empty input.'
        },
        {
          input: '[1]',
          expectedOutput: '[1]',
          explanation: 'Handles single element input.'
        }
      ],
      constraints: [
        'Input size should be validated before processing.',
        'Optimize for linear or near-linear time where possible.'
      ]
    };

    if (!this.client) {
      return defaultPayload;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'Return strict JSON only. Do not include markdown.'
          },
          {
            role: 'user',
            content: String(prompt || '')
          }
        ]
      });

      const raw = completion?.choices?.[0]?.message?.content || '';
      if (!raw) return defaultPayload;

      try {
        return JSON.parse(raw);
      } catch (parseError) {
        return defaultPayload;
      }
    } catch (error) {
      return defaultPayload;
    }
  }

  async processSpeechToText(audioBuffer) {
    if (!audioBuffer) {
      return 'No audio input received.';
    }
    return 'Audio received and transcribed in fallback mode.';
  }

  async generateInterviewAssessment(performanceSummary, session) {
    return {
      strengths: [
        'Maintained progress through the interview workflow.',
        'Submitted executable code iterations during the session.'
      ],
      weaknesses: [
        'Opportunity to improve edge-case validation depth.',
        'Opportunity to improve explanation clarity for trade-offs.'
      ],
      recommendations: [
        'Practice timed problem solving with post-run complexity review.',
        'Add explicit checks for boundary conditions before submission.'
      ],
      summary: 'Interview assessment generated using fallback analyzer.'
    };
  }

  async generateTestBasedResponse(testAnalysisContext) {
    const totalTests = Number(testAnalysisContext?.totalTests || 0);
    const passedTests = Number(testAnalysisContext?.passedTests || 0);
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    return {
      analysis: `Test execution completed: ${passedTests}/${totalTests} passed (${score}%).`,
      questions: [
        'Which failed test reveals the core logic gap?',
        'Can you reduce repeated work inside loops for better performance?'
      ],
      feedback: 'Focus on failing test cases first, then optimize once correctness is stable.'
    };
  }

  async generateInterviewFeedback(interview) {
    return {
      strengths: ['Completed interview flow and produced solution attempts.'],
      weaknesses: ['Needs deeper validation against edge scenarios.'],
      recommendations: ['Practice targeted debugging with custom test design.'],
      detailedAnalysis: 'Fallback interview feedback generated without external AI dependency.'
    };
  }

  async generateAudioAnalysis(context) {
    const spokenText = context?.spokenText ? String(context.spokenText) : '';
    if (!spokenText.trim()) {
      return 'I could not detect clear spoken input. Please try again with a brief summary.';
    }
    return 'Received your spoken input. In fallback mode, please continue by describing your approach step by step.';
  }
}

const aiService = new AIService();

module.exports = {
  aiService,
  initializeAI: () => aiService.initializeAI()
};
