document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('uploadForm');
  const resultDiv = document.getElementById('result');
  const imagePreview = document.getElementById('imagePreview');

  const fileInput = form.querySelector('input[type="file"]');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      imagePreview.style.display = 'none';
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button');

    if (!fileInput.files.length) {
      alert("Please select an image file.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Analyzing...";

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "success") {
        resultDiv.innerHTML = `<p style="color: red;">${data.message || "An error occurred."}</p>`;
        return;
      }

      if (data.analysis && data.analysis.faces && data.analysis.faces.length > 0) {
        const face = data.analysis.faces[0].attributes;
        const rec = data.recommendations;

        resultDiv.innerHTML = `
          <h2>🧠 Facial Analysis Result</h2>

          <div class="card">
            <h3>🌟 Beauty Score</h3>
            <p>Female: ${face.beauty.female_score}</p>
            <p>Male: ${face.beauty.male_score}</p>
          </div>

          <div class="card">
            <h3>🙂 Emotions</h3>
            ${Object.entries(face.emotion).map(([k, v]) => `<p>${k}: ${v.toFixed(2)}</p>`).join('')}
          </div>

          <div class="card">
            <h3>🧴 Skin Status</h3>
            <p>Acne: ${face.skinstatus.acne}</p>
            <p>Dark Circles: ${face.skinstatus.dark_circle}</p>
            <p>Health: ${face.skinstatus.health}</p>
            <p>Stains: ${face.skinstatus.stain}</p>
          </div>

          <div class="card">
            <h3>💡 Recommendations</h3>
            ${Object.entries(rec).map(([key, val]) => {
              return `<div class="recommendation-item">
                <p><strong>${key}:</strong> ${val.text}</p>
              </div>`;
            }).join('')}
          </div>
        `;
      } else {
        resultDiv.innerHTML = `<p style="color: red;">No face detected in the image. Please try another photo.</p>`;
      }

    } catch (err) {
      console.error("Error:", err);
      resultDiv.innerHTML = `<p style="color: red;">Something went wrong. Please try again.</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Analyze Face";
    }
  });
});
