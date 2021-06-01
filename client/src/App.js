import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./App.css";

import AppBar from "./components/AppBar";
import Message from "./components/Message";
import Sidebar from "./components/Sidebar";
import SidebarItem from "./components/SidebarItem";

import utils from "./Utils";

import { Grommet, Box, Heading, Button, Text, TextInput } from "grommet";
import openSocket from "socket.io-client";
import Controller from "./Controller";

const socket = openSocket();

const theme = {
  global: {
    colors: {
      brand: "#00bef0",
      "accent-1": "#00fbb9",
      "light-1": "#ffffff",
      "light-2": "#fafbfc",
      "light-3": "#f3f4f6"
    },
    button: {
      color: "#ffffff"
    },
    font: {
      family: "Overpass",
      size: "14px",
      height: "20px"
    }
  }
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: [],
      messages: [],
      currentThreadId: "",
      currentFromNumber: "",
      currentToNumbers: "",
      messageText: "",
      composingNewThread: false
    };
    this.controller = new Controller(this);
    this.onThreadClickHandler = this.onThreadClickHandler.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.controller.refreshThreads().then(threads => {
      if (threads.length > 0) {
        this.controller.getMessagesForThread(threads[0].id);
      }
    });

    socket.on("threads", threads => {
      this.setState({
        threads: threads
      });
    });

    socket.on("messages", payload => {
      if (payload.threadId === this.state.currentThreadId) {
        this.setState({ messages: payload.messages });
      }
    });
  }

  render() {
    return (
      <Grommet theme={theme} full>
        <Box fill>
          <AppBar>
            <Box direction="row" align="center">
              <svg class="header-logo">
                <path
                  class="header-logo-path text"
                  d="M52.53,14.57A7.46,7.46,0,0,0,47.09,17v-10H45.48v22a14.53,14.53,0,0,0,5.35,1.13A8.35,8.35,0,0,0,57,27.94a8.06,8.06,0,0,0,2.31-6,7.5,7.5,0,0,0-1.89-5.29A6.27,6.27,0,0,0,52.53,14.57Zm3.09,12.19a6.6,6.6,0,0,1-4.83,1.88,10.42,10.42,0,0,1-3.7-.71V18.82q2.55-2.91,5.25-2.91a4.7,4.7,0,0,1,3.72,1.72A6.49,6.49,0,0,1,57.54,22,6.34,6.34,0,0,1,55.62,26.76ZM85.68,14.57a5.7,5.7,0,0,0-5,2.91h-.07V14.86H79V29.91h1.61V19.36q1.94-3.22,4.94-3.22,4.1,0,4.1,5.2v8.57h1.61V20.74a6.37,6.37,0,0,0-1.53-4.53A5.31,5.31,0,0,0,85.68,14.57Zm53.77,15.34h1.62v-15h-1.62Zm0-20h1.62V7.05h-1.62Zm48,6.33a5.3,5.3,0,0,0-4.08-1.64,5.7,5.7,0,0,0-5,2.91h-.07V7.06h-1.6V29.91h1.6V19.36c1.34-2.15,3-3.22,4.94-3.22,2.74,0,4.1,1.73,4.1,5.2v8.57H189V20.7A6.32,6.32,0,0,0,187.47,16.21ZM73.35,28.59c-.24,0-.36-.26-.36-.77V18.5a3.42,3.42,0,0,0-1.33-2.92,5.43,5.43,0,0,0-3.38-1,9.23,9.23,0,0,0-4.87,1.6v1.65A7.77,7.77,0,0,1,68,15.91q3.35,0,3.35,3.08V20.9a13.66,13.66,0,0,0-6.52,1.63,4.35,4.35,0,0,0-2.28,3.87,3.59,3.59,0,0,0,1.18,2.69,4,4,0,0,0,2.89,1.12,7.65,7.65,0,0,0,4.73-1.87,4.16,4.16,0,0,0,.31,1.5.81.81,0,0,0,.74.37h.06a7.23,7.23,0,0,0,3-.77V27.89a7.7,7.7,0,0,1-2.16.7Zm-2-1.65a6.39,6.39,0,0,1-4.2,1.94A3.2,3.2,0,0,1,65,28.16a2.25,2.25,0,0,1-.85-1.76,3.52,3.52,0,0,1,2-3.07,9.39,9.39,0,0,1,5.15-1.09Zm59.33.55h0a2.29,2.29,0,0,1-.59,1.14,2.38,2.38,0,0,1-.6-1.12L126,17c-.59-1.78-1.43-2.16-2-2.16s-1.43.38-2,2.16l-3.5,10.48a2.38,2.38,0,0,1-.6,1.12,2.39,2.39,0,0,1-.59-1.14h0l-3.92-12.62h-1.57l4.06,13.07h0c.57,1.82,1.4,2.21,2,2.22h0c.6,0,1.43-.38,2-2.17l3.5-10.48a2.25,2.25,0,0,1,.61-1.12h0a2.38,2.38,0,0,1,.6,1.12L128.08,28c.6,1.79,1.43,2.17,2,2.17h0c.61,0,1.44-.4,2-2.22h0l4.06-13.07h-1.56ZM168,28a7.14,7.14,0,0,1-.36-2.84V16.17h4.24V14.86h-4.24v-5s-1.61,0-1.61,2.11v2.87H162v1.31h4.07V27a2.93,2.93,0,0,0,1,2.36,3.74,3.74,0,0,0,2.49.85,7.17,7.17,0,0,0,3.12-.77V27.9a6.72,6.72,0,0,1-2.76.74C168.9,28.64,168.27,28.41,168,28ZM107,15.8a10,10,0,0,0-4.47-1.21,7.33,7.33,0,0,0-5.45,2.23A7.65,7.65,0,0,0,94.9,22.4,7.68,7.68,0,0,0,97.1,28a7.27,7.27,0,0,0,5.42,2.26A7.57,7.57,0,0,0,107,28.76v1.18h1.62V7.08H107Zm0,11.49a7.08,7.08,0,0,1-4.07,1.37,6.08,6.08,0,0,1-4.51-1.81A6.17,6.17,0,0,1,96.6,22.3a6.07,6.07,0,0,1,1.69-4.41,5.77,5.77,0,0,1,4.3-1.73,8,8,0,0,1,4.4,1.41ZM157.28,15.8a10,10,0,0,0-4.46-1.21,7.31,7.31,0,0,0-5.45,2.23,7.65,7.65,0,0,0-2.18,5.58A7.69,7.69,0,0,0,147.4,28a7.27,7.27,0,0,0,5.42,2.26,7.54,7.54,0,0,0,4.46-1.47v1.18h1.63V7.08h-1.63Zm0,11.49a7.06,7.06,0,0,1-4.07,1.37,6.11,6.11,0,0,1-4.51-1.81,6.2,6.2,0,0,1-1.8-4.55,6,6,0,0,1,1.69-4.41,5.76,5.76,0,0,1,4.3-1.73,8,8,0,0,1,4.39,1.41Z"
                />
                <path
                  class="header-logo-path icon"
                  d="M27.18,10.13c-1.4-.3-1.56.43-1,1.76,3.17,7,.35,13.83-2.67,15.53a3.15,3.15,0,0,1-.08-.69c-.36-3.32-1.62-6.21-2.47-6.21-.68,0-.26,2.84-.44,5.35-1.12-.66-1.8-1.13-3-.92-1.71.3-4,3.93-4.07,3.41-.68-4.2.95-10.66,3.21-11.35.35-.14,1,.4,2.34.91,1.07.41.94-.66.45-1.06A5.19,5.19,0,0,0,14,16.47c-3.4,1.66-4.94,9.22-3.11,12.31a4.79,4.79,0,0,0,3.41,2.36c2.28.26,3-.22,4.81-2.47a2.17,2.17,0,0,0,.87.42c-1.5,4.66-7.11,8.59-8.32,7.92-5.88-4-4.25-16.79-.1-28a63.24,63.24,0,0,0,2-6.23c.62-3-3.2-3.62-5.82-1.4C5.83,3,4,6.72,2.51,11.09-2.24,25-.22,36.7,8.28,39.25c9.78,2.92,14.44-3.18,15.16-9.31a11.67,11.67,0,0,0,1.8.09c3-.06,7.33-1.62,8.61-8.24C34.82,16.79,31.61,11,27.18,10.13Z"
                />
              </svg>
              <Heading level="3" margin={{ horizontal: "small" }}>
                My Little Phoney
              </Heading>
            </Box>
          </AppBar>
          <Box direction="row" fill>
            <Sidebar onNewThreadClick={this.handleNewThreadClick}>
              {this.state.composingNewThread ? (
                <SidebarItem title="New thread..." active={true} />
              ) : (
                undefined
              )}
              {this.state.threads.map(thread => {
                return (
                  <SidebarItem
                    title={thread.id}
                    subtitle={thread.text}
                    onClick={() => {
                      this.onThreadClickHandler(thread.id);
                    }}
                    unreadCount={thread.unread_count}
                    active={
                      thread.id === this.state.currentThreadId &&
                      !this.state.composingNewThread
                    }
                  />
                );
              })}
            </Sidebar>
            <Box fill>

              <Box pad="small" elevation="small" direction="row">
                {/* from number text box */}
                <TextInput
                  placeholder="From number"
                  value={this.state.composingNewThread ? this.state.currentFromNumber : utils.threadIdToFromNumber(this.state.currentThreadId)}
                  onChange={this.handleFromNumberTextChange}
                  onKeyDown={this.handleKeyPressOnNumberInput}
                  ref={input => {
                    this.fromNumberInput = input;
                  }}
                />

                {/* to number text box */}
                <TextInput
                  placeholder="To number(s)"
                  value={this.state.composingNewThread ? this.state.currentToNumbers : utils.threadIdToFriendlyList(this.state.currentThreadId)}
                  onChange={this.handleToNumbersTextChange}
                  onKeyDown={this.handleKeyPressOnNumberInput}
                  ref={input => {
                    this.toNumbersInput = input;
                  }}
                />
              </Box>

              {/* conversation box */}
              <Box
                fill
                justify="end"
                overflow={{ vertical: "scroll" }}
                ref={el => {
                  this.scrollBox = el;
                }}
              >
                <Box pad="small">
                  {this.state.messages.map(message => {
                    let sentiment;
                    if (message.analysis) {
                      sentiment = message.analysis.Sentiment;
                    }
                    return (
                      <Message
                        out={message.direction === "out"}
                        sentiment={sentiment}
                      >
                        {message.text}
                      </Message>
                    );
                  })}
                </Box>
              </Box>

              {/* message text box and send button */}
              <Box
                direction="row"
                border={{ side: "top", color: "border", width: "xsmall" }}
                pad="small"
                elevation="medium"
              >
                <TextInput
                  value={this.state.messageText}
                  onChange={event => {
                    this.setState({ messageText: event.target.value });
                  }}
                  onKeyDown={this.handleKeyPress}
                  onFocus={this.handleFocusOnTextInput}
                  ref={input => {
                    this.textInput = input;
                  }}
                />
                <Button
                  margin={{ left: "small" }}
                  label="Send"
                  onClick={this.sendMessage}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Grommet>
    );
  }

  async onThreadClickHandler(threadId) {
    this.setState({ composingNewThread: false });
    await this.controller.getMessagesForThread(threadId);
    await this.controller.refreshThreads();
    this.textInput.focus();
  }

  handleNewThreadClick = e => {
    this.setState({
      composingNewThread: true,
      messages: [],
      currentThreadId: "",
      currentFromNumber: "",
      currentToNumbers: ""
    });
    this.fromNumberInput.focus();
  };

  handleToNumbersTextChange = e => {
    if (this.state.composingNewThread) {
      console.log(e.target.value);
      this.setState({ currentToNumbers: e.target.value });
    }
  };

  handleFromNumberTextChange = e => {
    if (this.state.composingNewThread) {
      console.log(e.target.value);
      this.setState({ currentFromNumber: e.target.value });
    }
  };

  handleKeyPressOnNumberInput = async e => {
    if (this.state.composingNewThread) {
      let keyCode = e.keyCode || e.which;
      let newThreadId = utils.sanitizeThreadId(this.state.currentFromNumber, this.state.currentToNumbers);
      if (keyCode === 13 && newThreadId !== "") {
        this.setState({
          currentThreadId: newThreadId,
        });
        this.state.threads.forEach(async thread => {
          if (newThreadId === thread.id) {
            // We already have a thread with this ID so just load that one
            this.setState({ composingNewThread: false });
            await this.controller.getMessagesForThread(thread.id);
            await this.controller.refreshThreads();
          }
        });
        this.textInput.focus();
      }
    }
  };

  handleKeyPress = e => {
    let keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      this.sendMessage();
    }
  };

  handleFocusOnTextInput = async e => {
    if (this.state.composingNewThread) {
      let newThreadId = utils.sanitizeThreadId(this.state.currentFromNumber, this.state.currentToNumbers);
      if (newThreadId !== "") {
        this.setState({
          currentThreadId: newThreadId,
        });
        this.state.threads.forEach(async thread => {
          if (newThreadId === thread.id) {
            // We already have a thread with this ID so just load that one
            this.setState({ composingNewThread: false });
            await this.controller.getMessagesForThread(thread.id);
            await this.controller.refreshThreads();
          }
        });
      }
    }
  };

  sendMessage() {
    this.controller.sendMessage();
  }

  scrollToBottom() {
    if (ReactDOM.findDOMNode(this.scrollBox)) {
      let scrollBox = ReactDOM.findDOMNode(this.scrollBox);
      let maxScroll = scrollBox.scrollHeight - scrollBox.offsetHeight;
      scrollBox.scrollTop = maxScroll;
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }
}
