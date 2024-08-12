"use client"

import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material"
import { useState, useRef, useEffect } from "react"
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebase'
import MarkdownView from 'react-showdown';
import Link from "next/link";

export default function Home() {
  const [loaded, setLoaded] = useState(true)
  const [currAccount, setCurrAccount] = useState('Guest')
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hello! I'm Alonzo, your personal assistant! Got any questions about a future in software? I'm here to help!` }])
  const [userName, setUserName] = useState('')

  const uploadHistory = async () => {
    let val = localStorage.getItem('loggedIn')
    if (val) {
      setCurrAccount(val)
    } else {
      setCurrAccount('Guest')
    }
    if (window.location.href.slice(-9) == 'loggedOut') {
      localStorage.setItem('loggedIn', '')
      window.location.href = window.location.href.slice(0, -20)
    }
    if (val != 'Guest') {
      const snapshot = query(collection(firestore, 'alonzo'))
      const docs = await getDocs(snapshot)
      docs.forEach((doc) => {
        if (doc.id == val) {
          if (doc.data()['history']) {
            setMessages(doc.data()['history'])
          }
          setUserName('The user\'s name is ' + doc.data()['fName'] + ' ' + doc.data()['lName'])
        }
      })
    }
  }
  
  useEffect(() => {
    if (loaded) {
      uploadHistory()
    }
    setLoaded(false)
  })

  const showLogOut = currAccount !== 'Guest';

  const [message, setMessage] = useState('')
  const systemPrompt = `
    You are Alonzo, a personal assistant chatbot dedicated to helping users understand a future in software better. You are named after Alonzo Church, the inventor of Lambda Calculus.

    Your job is to attentively listen to what the user is saying, and make them feel more comfortable about their situation, while injecting humour into your responses. The best humour is puns - try to include at least one per sentence.
  `

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ])

    var unpackedMessages = ''
    for (let i = 0; i < messages.length; i++) {
      unpackedMessages = unpackedMessages + `\n${messages[i]['role']}: ${messages[i]['content']}`
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userName + systemPrompt + unpackedMessages + ".\n\n Here is the prompt: " + message),
    })

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    var temp = []

    while (true) {
      const { done, value } = await reader.read()

      if (done) break;
      const text = decoder.decode(value, { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        temp = [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
        return temp
      })
    }
    if (currAccount != "Guest") {
      const docRef = doc(collection(firestore, 'alonzo'), currAccount)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        await setDoc(docRef, { history: temp }, { merge: true })
      }
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={4}
    >
      <Box
        component="img"
        sx={{
          height: "80px"
        }}
        src="/alonzo.png"
      />
      {!showLogOut && (
        <Stack
          direction={'row'}
          gap={2}
        >
          <a href="/signup">Sign Up</a>
          <Divider orientation="vertical" />
          <a href="/signin">Sign In</a>
        </Stack>
      )}
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
      >
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto">
          {
            messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                  color="white"
                  borderRadius={4}
                  p={3}
                >
                  <MarkdownView
                    markdown={message.content}
                    options={{ tables: true, emoji: true }}
                  />
                </Box>
              </Box>
            ))
          }
          <div ref={messagesEndRef} />
        </Stack>
        <Stack
          direction={'row'}
          spacing={2}
          marginTop={2}
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
      <Stack
        direction={'row'}
        gap={2}
      >
        <p>Logged in as {currAccount}</p>
        <Divider
          orientation="vertical"
        />
        <a onClick={() => setMessages([{ role: 'assistant', content: `Hello! I'm Alonzo, your personal assistant! Got any questions about a future in software? I'm here to help!` }])}>Clear chat history</a>
        {showLogOut && (
          <Stack
            direction={'row'}
            gap={2}
          >
            <Divider
              orientation="vertical"
            />
            <Link
              href='/logout'
            >Log Out</Link>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}