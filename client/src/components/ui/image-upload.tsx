import { useState } from "react";

export default function ImageUpload({ onUpload, setUploading: setParentUploading }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    if (setParentUploading) setParentUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (setParentUploading) setParentUploading(false);
    if (data.url) {
      console.log("ImageUpload component: onUpload called with URL:", data.url);
      onUpload(data.url);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && (
        <img src={preview} alt="Preview" style={{ maxWidth: 200, marginTop: 8 }} />
      )}
      {uploading && <div>Uploading...</div>}
    </div>
  );
}
