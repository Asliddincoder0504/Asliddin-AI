const API_KEY = "AIzaSyDEgHBmLn-maXmgx4OAnNyhOOJelzQaf_M"; // ← o‘zingizning Google API kalitingizni yozing

async function sendMessage() {
  const input = document.getElementById("userInput");
  const messages = document.getElementById("messages");
  const userText = input.value.trim();
  if (!userText) return;

  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.textContent = userText;
  messages.appendChild(userDiv);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  try {
    const prompt = `Foydalanuvchi savol berganda:
1. Agar u "seni kim yaratgan", "seni kim tuzgan", "seni kim yaratdi", "kim yozgan" kabi savollar bersa, javobing har doim: "Men Asliddin Norqobilov tomonidan dasturlanganman."
2. Agar u "isming nima", "sen kimsan", "noming nima" kabi savollar bersa, javobing: "Mening ismim Asliddin AI."
3. Agar foydalanuvchi dasturlash kodlarini so‘rasa (HTML, CSS, Python, JavaScript, C++ va h.k.), unga to‘liq kod yozib ber. Kodni \`\`\` belgisi orasida yoz.
Boshqa barcha savollarga oddiy o‘zbek tilida qisqa va aniq javob ber.

Savol: ${userText}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "❗️ Javob topilmadi.";

    const botDiv = document.createElement("div");
    botDiv.className = "message bot";

    if (reply.includes("```")) {
      const codeMatch = reply.match(/```([a-z]*)\n([\s\S]+?)```/);
      const lang = codeMatch?.[1] || "";
      const code = codeMatch?.[2] || reply;

      const pre = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.className = lang;
      codeEl.textContent = code;
      pre.appendChild(codeEl);

      const toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "📋 Nusxa olish";
      copyBtn.onclick = () => navigator.clipboard.writeText(code);

      const openBtn = document.createElement("button");
      openBtn.className = "open-btn";
      openBtn.textContent = "↗ Ochish";
      openBtn.onclick = () => {
        const win = window.open();
        win.document.write(`<pre style="white-space: pre-wrap;">${code.replace(/</g,"&lt;")}</pre>`);
      };

      toolbar.appendChild(copyBtn);
      toolbar.appendChild(openBtn);

      botDiv.appendChild(pre);
      botDiv.appendChild(toolbar);

      setTimeout(() => hljs.highlightElement(codeEl), 50);
    } else {
      botDiv.textContent = reply;
    }

    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    const errDiv = document.createElement("div");
    errDiv.className = "message bot";
    errDiv.textContent = "❗️ Xatolik: " + error.message;
    messages.appendChild(errDiv);
  }
}

document.getElementById("userInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});
