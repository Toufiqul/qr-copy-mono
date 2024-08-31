"use client";

import React, { useState } from "react";

function Copy() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  // Handle the file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (event.target.files && event.target.files.length > 0) {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  //   Handle the text input change
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  //   Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file && !text) {
      alert("Please enter text or upload a file.");
      return;
    }

    const formData = new FormData();

    // If a file is uploaded, append it to the FormData
    if (file) {
      formData.append("file", file);
    }

    // Append the text input to the FormData
    formData.append("text", text);

    try {
      // Send the form data to the backend
      const response = await fetch("http://localhost:4000/trpc/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Server Response:", data);
      alert("File/Text uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("File/Text upload failed.");
    }
  };
  //   const handleUpload = async (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (!file) {
  //       alert("Please select a file first.");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const response = await fetch("http://localhost:4000/files/upload", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to upload file.");
  //       }

  //       alert("File uploaded successfully!");
  //     } catch (error) {
  //       console.error(error);
  //       alert("Error uploading file.");
  //     }
  //   };

  return (
    <div className="flex-1 flex-center items-center">
      <form onSubmit={handleSubmit}>
        <h1>Paste the text or upload the file you want to copy</h1>
        <input
          className="border-2 border-black text-black"
          type="text"
          value={text}
          onChange={handleTextChange}
        />
        <input type="file" onChange={handleFileChange} />
        <div>
          <button className="border-2 border-black" type="submit">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}

export default Copy;
