import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

export const generateMonthlyPDF = async (data: any) => {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long", year: "numeric" });

  const bloodTestsHTML = data.blood_tests?.length
    ? data.blood_tests.map((test: any) => `
        <p><b>Date:</b> ${new Date(test.createdAt.seconds * 1000).toLocaleDateString()}</p>
        <p>anti-AChR: ${test.antiAChR}</p>
        <p>anti-MuSK: ${test.antiMuSK}</p>
        <p>anti-LRP4: ${test.antiLRP4}</p>
        <p>Note: ${test.notes || '-'}</p>
      `).join("<hr/>")
    : "<p>No blood tests this month.</p>";

  const dietHTML = data.diet?.length
    ? data.diet.slice(0, 3).map((item: any) => `
        <p><b>${item.breakfast}, ${item.lunch}, ${item.dinner}, ${item.snack}</b></p>
      `).join("")
    : "<p>No diet entries this month.</p>";

  const sleepHTML = data.sleep?.length
    ? data.sleep.slice(0, 3).map((item: any) => `
        <p>${item.hours} hrs - Quality: ${item.quality}</p>
      `).join("")
    : "<p>No sleep entries this month.</p>";

  const medicationHTML = data.medications?.length
    ? data.medications.slice(0, 3).map((item: any) => `
        <p><b>${item.name}</b>: ${item.dose} - Days: ${item.days.join(", ")}</p>
      `).join("")
    : "<p>No medication entries this month.</p>";

  const html = `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 24px; color: #1C1C1E; }
          h1 { color: #3A82F7; }
          h2 { margin-top: 24px; color: #1C1C1E; }
          p { margin: 4px 0; }
          .section { margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <h1>Monthly Health Report - ${month}</h1>

        <div class="section">
          <h2>Blood Tests</h2>
          ${bloodTestsHTML}
        </div>

        <div class="section">
          <h2>Diet</h2>
          <p>Entries: ${data.diet?.length || 0}</p>
          ${dietHTML}
        </div>

        <div class="section">
          <h2>Sleep</h2>
          <p>Entries: ${data.sleep?.length || 0}</p>
          ${sleepHTML}
        </div>

        <div class="section">
          <h2>Symptoms</h2>
          <p>Entries: ${data.symptoms?.length || 0}</p>
        </div>

        <div class="section">
          <h2>Medications</h2>
          <p>Entries: ${data.medications?.length || 0}</p>
          ${medicationHTML}
        </div>

        <div class="section">
          <h2>Clinical Surveys</h2>

          ${data.surveys?.mg_adl ? `
            <h3>MG-ADL</h3>
            <p>Score: ${data.surveys.mg_adl.answers.reduce((a: number, b: number) => a + b, 0)}</p>
            <p>Date: ${new Date(data.surveys.mg_adl.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>MG-ADL: Not compiled this month.</p>"}

          ${data.surveys?.mg_qol15 ? `
            <h3>MG-QoL15</h3>
            <p>Score: ${data.surveys.mg_qol15.answers.reduce((a: number, b: number) => a + b, 0)}</p>
            <p>Date: ${new Date(data.surveys.mg_qol15.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>MG-QoL15: Not compiled this month.</p>"}

          ${data.surveys?.mgfa ? `
            <h3>MGFA Classification</h3>
            <p>Class: ${data.surveys.mgfa.classification}</p>
            <p>Date: ${new Date(data.surveys.mgfa.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>MGFA: Not compiled this month.</p>"}

          ${data.surveys?.eq5d5l ? `
            <h3>EQ-5D-5L</h3>
            <p>VAS Score: ${data.surveys.eq5d5l.responses.vasScore}</p>
            <p>Dimensions:</p>
            <ul>
              <li>Mobility: ${data.surveys.eq5d5l.responses.mobility}</li>
              <li>Self-care: ${data.surveys.eq5d5l.responses.selfCare}</li>
              <li>Usual Activities: ${data.surveys.eq5d5l.responses.usualActivities}</li>
              <li>Pain/Discomfort: ${data.surveys.eq5d5l.responses.painDiscomfort}</li>
              <li>Anxiety/Depression: ${data.surveys.eq5d5l.responses.anxietyDepression}</li>
            </ul>
            <p>Date: ${new Date(data.surveys.eq5d5l.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>EQ-5D-5L: Not compiled this month.</p>"}

          ${data.surveys?.hads ? `
            <h3>HADS</h3>
            <p>Anxiety Score: ${data.surveys.hads.responses.anxietyScore}</p>
            <p>Depression Score: ${data.surveys.hads.responses.depressionScore}</p>
            <p>Total Score: ${data.surveys.hads.responses.totalScore}</p>
            <p>Date: ${new Date(data.surveys.hads.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>HADS: Not compiled this month.</p>"}

          ${data.surveys?.hui3 ? `
            <h3>HUI3</h3>
            <p>Summary Score: ${data.surveys.hui3.responses.summaryScore ?? "—"}</p>
            <p>Attributes:</p>
            <ul>
              <li>Vision: ${data.surveys.hui3.responses.vision}</li>
              <li>Hearing: ${data.surveys.hui3.responses.hearing}</li>
              <li>Speech: ${data.surveys.hui3.responses.speech}</li>
              <li>Ambulation: ${data.surveys.hui3.responses.ambulation}</li>
              <li>Dexterity: ${data.surveys.hui3.responses.dexterity}</li>
              <li>Emotion: ${data.surveys.hui3.responses.emotion}</li>
              <li>Cognition: ${data.surveys.hui3.responses.cognition}</li>
              <li>Pain: ${data.surveys.hui3.responses.pain}</li>
            </ul>
            <p>Date: ${new Date(data.surveys.hui3.lastCompiledAt.seconds * 1000).toLocaleDateString()}</p>
          ` : "<p>HUI3: Not compiled this month.</p>"}
        </div>

      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      alert("Impossibile aprire una nuova finestra. Controlla il blocco pop-up.");
    }
    return;
  }

  let uri = "";

  try {
    const result = await Print.printToFileAsync({ html });
    if (!result?.uri) throw new Error("printToFileAsync non ha restituito un URI.");
    uri = result.uri;
  } catch (err) {
    console.error("Errore durante la generazione del PDF:", err);
    alert("Errore durante la generazione del PDF.");
    return;
  }

  if (Platform.OS === "ios") {
    await Sharing.shareAsync(uri);
  } else {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      alert("PDF salvato nella cartella Download");
    }
  }
};
