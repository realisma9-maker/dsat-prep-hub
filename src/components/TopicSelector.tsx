import { Calculator, Brain, BarChart3, Shapes } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const topics: Topic[] = [
  {
    id: 'algebra',
    name: 'Algebra',
    description: 'Linear equations, inequalities, systems, and functions',
    icon: <Calculator className="w-10 h-10" />,
  },
  {
    id: 'advanced_math',
    name: 'Advanced Math',
    description: 'Quadratics, polynomials, exponentials, and radicals',
    icon: <Brain className="w-10 h-10" />,
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving & Data Analysis',
    description: 'Ratios, percentages, statistics, and probability',
    icon: <BarChart3 className="w-10 h-10" />,
  },
  {
    id: 'geometry',
    name: 'Geometry & Trigonometry',
    description: 'Angles, triangles, circles, and trigonometric functions',
    icon: <Shapes className="w-10 h-10" />,
  },
];

interface TopicSelectorProps {
  onSelectTopic: (topicId: string) => void;
}

export function TopicSelector({ onSelectTopic }: TopicSelectorProps) {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Top 150 Hardest Math for DSAT
          </h1>
          <p className="text-lg text-muted-foreground">
            Confidence Boost Collection — Select a topic to begin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className="topic-tile text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {topic.name}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Practice with the most challenging questions from official DSAT practice tests
          </p>
        </div>
      </div>
    </div>
  );
}
