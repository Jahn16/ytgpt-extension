window.addEventListener("load", async () => {
  const insertMessage = (msgContent, author) => {
    const msgsDiv = document.getElementById("msgs");
    const newMsg = document.createElement("div");
    newMsg.classList.add(author);
    const newMsgText = document.createElement("p");
    newMsgText.textContent = `${author}: ${msgContent}`;
    newMsg.append(newMsgText);
    msgsDiv.appendChild(newMsg);
  };

  const getVideoID = async () => {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const url = new URL(tabs[0].url);
    return url.searchParams.get("v");
  };
  const fetchVideo = async (videoID) => {
    const url = `https://<ytgpt-url>/api/v1/transcribe?youtube_id=${videoID}`;
    let response;
    try {
      response = await fetch(url);
    } catch (err) {
      insertMessage("erro", "error");
      return {};
    }

    if (!response.ok) {
      insertMessage(await response.text(), "error");
    }
    return await response.json();
  };

  const setup = async () => {
    insertMessage("Retrieving youtube information...", "bot");
    const videoID = await getVideoID();
    const video = await fetchVideo(videoID);
    insertMessage(video["title"], "teste");
    return video;
  };
  const video = await setup();
  const callGPT = async (prompt, video) => {
    const url = "https://<ytgpt-url>/api/v1/gpt";
    const data = {
      video: video,
      prompt: prompt,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.text();
  };

  let sendMessageBtn = document.getElementById("sendMsg");
  sendMessageBtn.addEventListener("click", async () => {
    let msgContent = document.getElementById("msg").value;
    insertMessage(msgContent, "you");
    let gptAnswer = await callGPT(msgContent, video);
    insertMessage(gptAnswer, "bot");
  });
});
