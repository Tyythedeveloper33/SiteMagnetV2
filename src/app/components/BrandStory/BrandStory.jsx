import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { HelpCircle } from "lucide-react";

const BrandStory = ({ userId }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);

  const questions = [
    "What is your business name?",
    "Who is your customer and what do they want?",
    "What problem are they facing externally?",
    "How does that problem make them feel internally?",
    "Who or what is the villain in your brand story?",
    "Why is it just plain wrong for them to experience that?",
    "How do you show empathy and authority as the guide?",
    "What’s your plan for helping them win?",
    "What’s the direct call to action?",
    "What does success look like?",
    "What does failure look like if they don’t act?",
  ];

  const questionToFieldMapping = {
    "What is your business name?": "brand_name",
    "Who is your customer and what do they want?": "character",
    "What problem are they facing externally?": "external_problem",
    "How does that problem make them feel internally?": "internal_problem",
    "Who or what is the villain in your brand story?": "villain",
    "Why is it just plain wrong for them to experience that?": "philosophical_problem",
    "How do you show empathy and authority as the guide?": "empathy",
    "What’s your plan for helping them win?": "plan",
    "What’s the direct call to action?": "authority",
    "What does success look like?": "positive_outcomes",
    "What does failure look like if they don’t act?": "avoid_failure",
  };

  const getTooltipForQuestion = (question) => {
    const tooltips = {
      "Who is your customer and what do they want?": "Describe your ideal customer and their biggest desire.",
      "What problem are they facing externally?": "Explain the visible, tangible problem they're encountering.",
      "How does that problem make them feel internally?": "Talk about the emotions and stress the problem creates.",
      "Who or what is the villain in your brand story?": "Identify an obstacle, mindset, or entity working against them.",
      "Why is it just plain wrong for them to experience that?": "Appeal to justice—why shouldn't they face this?",
      "How do you show empathy and authority as the guide?": "Show you understand and can confidently lead them.",
      "What’s your plan for helping them win?": "Outline the steps or framework that leads them to success.",
      "What’s the direct call to action?": "What's the clearest next step you want them to take?",
      "What does success look like?": "Describe how their life or business improves with your help.",
      "What does failure look like if they don’t act?": "What pain or loss will they face if they don’t choose you?",
    };
    return tooltips[question] || "";
  };

  useEffect(() => {
    const fetchOrCreateForm = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('brand_story_forms')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Fetch error:', error);
          return;
        }

        if (data) {
          setFormData(data);
        } else {
          const { data: newForm, error: insertError } = await supabase
            .from('brand_story_forms')
            .insert({ user_id: userId })
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
          } else {
            setFormData(newForm);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrCreateForm();
    }
  }, [userId]);

  const handleChange = async (value) => {
    if (!formData) return;
    const field = questionToFieldMapping[questions[currentQuestion]];
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    const { error } = await supabase
      .from('brand_story_forms')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', formData.id);

    if (error) console.error('Update error:', error);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      setProgress(((next) / questions.length) * 100);
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;

    // First, update the brand_story_forms table
    const { error: formError } = await supabase
      .from('brand_story_forms')
      .update({ is_submitted: true })
      .eq('id', formData.id);

    if (formError) {
      console.error("Failed to submit brand story form:", formError);
      return;
    }

    // Then, update the user's brand_stage to 2
    const { error: userError } = await supabase
      .from('users') // or 'public.user' depending on your schema
      .update({ brand_stage: 2 })
      .eq('id', userId); // you're already receiving this as a prop

    if (userError) {
      console.error("Failed to update user's brand_stage:", userError);
      return;
    }

    alert('Brand story submitted and stage advanced!');
  };



  if (loading || !formData) return <p className="text-center mt-10">Loading brand story...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-10 space-y-6 border border-gray-100">
      <h1 className="text-3xl font-bold text-center text-gray-900">✨ Build Your Brand Story</h1>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-black h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">{Math.round(progress)}% Complete</p>
      </div>

      {/* Current Question */}
      <div>
        <div className="flex items-start gap-2 mb-2 relative">
          <p className="text-md font-medium text-gray-700">{questions[currentQuestion]}</p>
          <div className="group relative mt-1">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-black cursor-pointer" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-64 shadow-lg">
              {getTooltipForQuestion(questions[currentQuestion])}
            </div>
          </div>
        </div>

        <textarea
          value={formData[questionToFieldMapping[questions[currentQuestion]]] || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none text-gray-800"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          disabled={currentQuestion === 0}
          onClick={() => {
            const prev = currentQuestion - 1;
            setCurrentQuestion(prev);
            setProgress(((prev) / questions.length) * 100);
          }}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            currentQuestion === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200 text-black"
          }`}
        >
          ← Back
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="bg-black text-white px-6 py-2 rounded-lg shadow hover:shadow-lg hover:bg-gray-900 transition"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:shadow-lg hover:bg-green-700 transition"
          >
            🚀 Submit Brand Story
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandStory;
