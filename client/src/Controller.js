export default class Controller {
  constructor(context) {
    this.context = context;
    this.sendMessage = this.sendMessage.bind(this);
  }

  async refreshThreads() {
    let threads = await fetch(`/api/threads`, {
      credentials: "same-origin"
    }).then(response => response.json());
    this.context.setState({ threads: threads });
    return threads;
  }

  async getMessagesForThread(threadId) {
    let messages = await fetch(`/api/threads/${threadId}`, {
      credentials: "same-origin"
    }).then(response => response.json());
    this.context.setState({
      messages: messages,
      currentThreadId: threadId
    });
    return messages;
  }

  async sendMessage() {
    let text = this.context.state.messageText;
    let threadId = this.context.state.currentThreadId;
    this.context.setState({ messageText: "", composingNewThread: false });
    let response = await fetch(`/api/threads/${threadId}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        from: this.context.state.currentFromNumber,
        to: this.context.state.currentToNumbers
      })
    });

    this.getMessagesForThread(threadId);
    return response;
  }
}
