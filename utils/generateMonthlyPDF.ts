import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

export const generateMonthlyPDF = async (data: any) => {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long", year: "numeric" });

  const bloodTestsHTML = data.blood_tests.length
    ? data.blood_tests.map((test: any) => `
        <p><b>Date:</b> ${new Date(test.createdAt.seconds * 1000).toLocaleDateString()}</p>
        <p>anti-AChR: ${test.antiAChR}</p>
        <p>anti-MuSK: ${test.antiMuSK}</p>
        <p>anti-LRP4: ${test.antiLRP4}</p>
        <p>Note: ${test.notes || '-'}</p>
      `).join("<hr/>")
    : "<p>No blood tests this month.</p>";

  const dietHTML = data.diet.length
    ? data.diet.slice(0, 3).map((item: any) => `
        <p><b>${item.breakfast}, ${item.lunch}, ${item.dinner}, ${item.snack}</b></p>
      `).join("")
    : "<p>No diet entries this month.</p>";

  const sleepHTML = data.sleep.length
    ? data.sleep.slice(0, 3).map((item: any) => `
        <p>${item.hours} hrs - Quality: ${item.quality}</p>
      `).join("")
    : "<p>No sleep entries this month.</p>";

  const medicationHTML = data.medications.length
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
          <p>Entries: ${data.diet.length}</p>
          ${dietHTML}
        </div>

        <div class="section">
          <h2>Sleep</h2>
          <p>Entries: ${data.sleep.length}</p>
          ${sleepHTML}
        </div>

        <div class="section">
          <h2>Symptoms</h2>
          <p>Entries: ${data.symptoms.length}</p>
        </div>

        <div class="section">
          <h2>Medications</h2>
          <p>Entries: ${data.medications.length}</p>
          ${medicationHTML}
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    // 👉 Su Web: apri l’HTML in una nuova tab per test/debug
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      alert("Impossibile aprire una nuova finestra. Controlla il blocco pop-up.");
    }
    return;
  }

  // 👉 Su mobile: genera e salva PDF
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
