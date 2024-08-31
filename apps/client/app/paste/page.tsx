"use client";
import React, { useState } from "react";

function Paste() {
  const [text, setText] = useState<string>("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value); // Update fileName state
  };
  const downloadFile = async () => {
    if (!text) {
      alert("Input File Name");
    } else {
      try {
        const response = await fetch(
          `http://localhost:4000/files/download/${text}`,
          {
            method: "GET",
          }
        );

        // Ensure the response is successful
        if (!response.ok) {
          throw new Error("Failed to download file");
        }
        const contentDisposition = response.headers.get("Content-Disposition");
        const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : "downloaded-file";
        console.log({
          contentDisposition: contentDisposition,
          fileName: fileName,
          fileNameMatch: fileNameMatch,
          // response: response.headers,
        });
        //   console.log(...response.headers);
        // Convert response to Blob
        const blob = await response.blob();

        // Create a link element
        const link = document.createElement("a");

        // Create a URL for the blob and set it as the href
        link.href = window.URL.createObjectURL(blob);

        // Set the download attribute with the desired file name
        link.download = fileName;

        // Append the link to the body
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();

        console.log(blob);
        // Remove the link from the document
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading the file:", error);
        alert("Error downloading the file.");
      }
    }
  };

  return (
    <div>
      <input
        className="border-2 border-black text-black"
        type="text"
        value={text}
        onChange={handleInputChange}
      />
      <button
        className="border-2 border-black bg-white text-black"
        onClick={downloadFile}
      >
        Download File
      </button>
    </div>
  );
}

export default Paste;
