import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TopicSelector } from '@/components/TopicSelector';
import { PracticeView } from '@/components/PracticeView';

const topicNames: Record<string, string> = {
  algebra: 'Algebra',
  advanced_math: 'Advanced Math',
  problem_solving: 'Problem Solving & Data Analysis',
  geometry: 'Geometry & Trigonometry',
};

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>DSAT Math Practice | Top 150 Hardest Questions</title>
        <meta name="description" content="Practice the hardest Digital SAT Math questions with our Bluebook-style interface. Features Desmos calculator, per-question timers, and detailed explanations." />
      </Helmet>

      {selectedTopic ? (
        <PracticeView
          topic={selectedTopic}
          topicName={topicNames[selectedTopic]}
          onBackToTopics={() => setSelectedTopic(null)}
        />
      ) : (
        <TopicSelector onSelectTopic={setSelectedTopic} />
      )}
    </>
  );
};

export default Index;
