import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Smile, Meh, Frown, Heart, Activity, Zap } from "lucide-react";
import { BackToHomeIcon } from "./BackToHome";

const moodOptions = [
  { value: 5, label: 'Excellent', icon: Smile, color: 'bg-green-500', emoji: '😄' },
  { value: 4, label: 'Good', icon: Smile, color: 'bg-green-400', emoji: '😊' },
  { value: 3, label: 'Okay', icon: Meh, color: 'bg-yellow-500', emoji: '😐' },
  { value: 2, label: 'Not Great', icon: Frown, color: 'bg-orange-500', emoji: '😕' },
  { value: 1, label: 'Terrible', icon: Frown, color: 'bg-red-500', emoji: '😭' }
];

const emotions = [
  'Happy', 'Sad', 'Anxious', 'Excited', 'Tired', 'Motivated', 'Stressed', 'Calm', 'Frustrated', 'Grateful'
];

const weeklyData = [
  { day: 'Mon', mood: 3, energy: 4 },
  { day: 'Tue', mood: 4, energy: 3 },
  { day: 'Wed', mood: 2, energy: 2 },
  { day: 'Thu', mood: 4, energy: 4 },
  { day: 'Fri', mood: 5, energy: 5 },
  { day: 'Sat', mood: 4, energy: 3 },
  { day: 'Sun', mood: 3, energy: 4 }
];

const moodDistribution = [
  { name: 'Excellent', value: 20, fill: '#22c55e' },
  { name: 'Good', value: 35, fill: '#84cc16' },
  { name: 'Okay', value: 25, fill: '#eab308' },
  { name: 'Not Great', value: 15, fill: '#f97316' },
  { name: 'Terrible', value: 5, fill: '#ef4444' }
];

interface MoodTrackerProps {
  onBack?: () => void;
}

export function MoodTracker({ onBack }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [view, setView] = useState<'track' | 'analytics'>('track');

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const saveMoodEntry = () => {
    if (!selectedMood) return;
    
    // In a real app, this would save to backend
    console.log({
      mood: selectedMood,
      emotions: selectedEmotions,
      notes,
      timestamp: new Date()
    });
    
    // Reset form
    setSelectedMood(null);
    setSelectedEmotions([]);
    setNotes('');
    
    // Show success message (could use toast)
    alert('Mood entry saved successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && <BackToHomeIcon onBack={onBack} size="md" />}
            <h1>Mood Tracker</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === 'track' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('track')}
            >
              Track
            </Button>
            <Button
              variant={view === 'analytics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('analytics')}
            >
              Analytics
            </Button>
          </div>
        </div>

        {view === 'track' ? (
          <div className="space-y-6">
            {/* Mood Selection */}
            <Card className="p-6">
              <h3 className="mb-4">How are you feeling today?</h3>
              <div className="grid grid-cols-1 gap-3">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        selectedMood === mood.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{mood.label}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${mood.color}`} />
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Emotions */}
            <Card className="p-6">
              <h3 className="mb-4">What emotions are you experiencing?</h3>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={selectedEmotions.includes(emotion) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEmotion(emotion)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h3 className="mb-4">Any additional thoughts?</h3>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind? What happened today that affected your mood?"
                rows={4}
              />
            </Card>

            {/* Save Button */}
            <Button
              onClick={saveMoodEntry}
              disabled={!selectedMood}
              className="w-full"
            >
              Save Mood Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Heart className="mx-auto text-red-500 mb-2" size={24} />
                <p className="text-2xl">3.8</p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </Card>
              <Card className="p-4 text-center">
                <Activity className="mx-auto text-blue-500 mb-2" size={24} />
                <p className="text-2xl">7</p>
                <p className="text-sm text-muted-foreground">Check-ins</p>
              </Card>
              <Card className="p-4 text-center">
                <Zap className="mx-auto text-yellow-500 mb-2" size={24} />
                <p className="text-2xl">3.6</p>
                <p className="text-sm text-muted-foreground">Avg Energy</p>
              </Card>
            </div>

            {/* Weekly Trend */}
            <Card className="p-6">
              <h3 className="mb-4">Weekly Mood Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Mood</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Energy</span>
                </div>
              </div>
            </Card>

            {/* Mood Distribution */}
            <Card className="p-6">
              <h3 className="mb-4">Mood Distribution (Last 30 Days)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {moodDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm">{entry.name}</span>
                    <span className="text-sm text-muted-foreground">({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Insights */}
            <Card className="p-6">
              <h3 className="mb-4">Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">📈 Your mood has improved by 15% this week compared to last week!</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm">🌟 You've been consistently tracking your mood for 7 days. Keep it up!</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm">💡 Your energy levels seem to dip on Wednesdays. Consider scheduling lighter activities.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}