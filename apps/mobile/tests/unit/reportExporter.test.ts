import { ReportExporter } from '../../src/services/export/reportExporter';
import { AnalysisResult } from '../../src/domain/types';

describe('ReportExporter', () => {
  it('generates markdown report with category, summary, origin, and limitations', () => {
    const mockResult: AnalysisResult = {
      id: 'test_123',
      createdAt: '2026-10-15T00:00:00.000Z',
      language: 'javascript',
      category: 'Runtime / Type Error',
      summary: 'Likely caused by Uninitialized Asynchronous State.',
      originalInput: "TypeError: Cannot read properties of undefined (reading 'map')",
      parsedInfo: {
        language: 'javascript',
        exceptionType: 'TypeError',
        rootFile: 'src/components/UserList.tsx',
        rootLine: 42,
        stackFrames: [],
      },
      candidates: [
        {
          id: 'cause_async_state_null',
          title: 'Uninitialized Asynchronous State',
          explanation: 'Data accessed before hook resolved.',
          score: 0.9,
          scoreLabel: 'High Confidence Match',
          evidence: [],
          suggestedChecks: [
            {
              title: 'Check State Initialization',
              instructions: ['Inspect useState default values.'],
              reason: 'Uninitialized values cause undefined errors.',
              risk: 'low',
            },
          ],
        },
      ],
      limitations: ['100% offline heuristic analysis.'],
      engineType: 'rules',
      engineVersion: '1.0.0',
    };

    const md = ReportExporter.generateMarkdownReport(mockResult);

    expect(md).toContain('# Bug Root Cause Analysis Report');
    expect(md).toContain('Runtime / Type Error');
    expect(md).toContain('Uninitialized Asynchronous State');
    expect(md).toContain('src/components/UserList.tsx');
    expect(md).toContain('42');
    expect(md).toContain('100% offline heuristic analysis.');
  });
});
