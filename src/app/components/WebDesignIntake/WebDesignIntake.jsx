import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient"; // Adjust if your client path is different
import { fetchBrandStoryData , fetchWebsiteIntakeData, fetchDeploySite} from "@/app/utils/supabaseHelpers";



const templates = [
  { id: "classic", name: "Classic", preview: "/classic.png" },
  { id: "modern", name: "Modern", preview: "/classic.png" },
  { id: "custom", name: "Custom", preview: "/custom.png" },
];

const WebDesignIntake = ({ userId }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [wantsLogoHelp, setWantsLogoHelp] = useState(false);
  const [inspirationLink, setInspirationLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState({
    brand_name:'',
    character:'',
    external_problem:'',
    internal_problem:'',
    philosophical_problem:'',
    villain:'',
    positive_outcomes:'',
    plan:'',
    empathy:'',
    authority:'',
    avoid_failure:'',
  });
  const [webDesignIntakeData, setWebDesignIntakeData] = useState({
    selected_template: '',
    logo_url: '',
    wants_logo_help:'',
    inspiration_link:'',
    notes: '',

  });

  useEffect(() => {
    if (brandData.character) {
      console.log("Got brandData:", brandData);
      console.log("Got webdesignintakeData:", webDesignIntakeData);
      if (webDesignIntakeData.notes && brandData.character ){
        fetchDeploySite(brandData,webDesignIntakeData, userId)
      }
      // Do what you need to do once brandData is ready
    }

  }, [brandData, webDesignIntakeData]);


  const handleLogoUpload = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    let logoUrl = null;
    console.log(userId);

    try {
      // Handle logo upload if a file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logos/${userId}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("logos")
          .getPublicUrl(fileName);

        logoUrl = publicUrlData.publicUrl;
      }

      // Insert design intake data
      const { error } = await supabase.from("web_design_intake").insert([
        {
          user_id: userId,
          selected_template: selectedTemplate,
          wants_logo_help: wantsLogoHelp,
          inspiration_link: inspirationLink,
          notes,
          logo_url: logoUrl,
        },
      ]);

      if (error) throw error;

      // Update user's brand_stage
      const { error: userError } = await supabase
        .from("users") // Update the 'users' table in the public schema
        .update({ brand_stage: 3 })
        .eq("id", userId);

      if (userError) {
        console.error("Failed to update user's brand_stage:", userError);
        return;
      }

      alert("Design intake submitted successfully!");
       const updatedBrandStory = await fetchBrandStoryData(userId)
       setBrandData(updatedBrandStory);
       const updatedwebIntake = await fetchWebsiteIntakeData(userId)
       setWebDesignIntakeData(updatedwebIntake);

      setSelectedTemplate(null);
      setLogoFile(null);
      setWantsLogoHelp(false);
      setInspirationLink("");
      setNotes("");
    } catch (err) {
      console.error("Submission error:", err.message);
      alert("There was a problem submitting your intake. Try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 2: Web Design Intake</h2>

      <div className="mb-6">
        <p className="mb-2 font-semibold">Choose a look:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedTemplate === template.id
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "hover:border-blue-300"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <img
                src={template.preview}
                alt={template.name}
                className="mb-2 w-full h-40 object-cover rounded"
              />
              <p className="text-center font-medium">{template.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Upload your logo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="file-input file-input-bordered w-full"
        />
      </div>

      <div className="mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={wantsLogoHelp}
            onChange={() => setWantsLogoHelp(!wantsLogoHelp)}
            className="checkbox"
          />
          <span>I'd like help creating a logo (extra service)</span>
        </label>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Design Notes or Inspiration:</label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share any thoughts about your vision, color scheme, etc."
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Website Inspiration Link:</label>
        <input
          type="url"
          className="input input-bordered w-full"
          placeholder="https://example.com"
          value={inspirationLink}
          onChange={(e) => setInspirationLink(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Design Preferences"}
      </button>
    </div>
  );
};

export default WebDesignIntake;
