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
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hello! I'm Alonzo, your personal assistant! Got any questions about your post-secondary future? I'm here to help!` }])
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
    You are Alonzo, an AI chatbot to help high school students in Ontario, Canada decide on their post-secondary education. Your job is to:
    Identify the student’s preferred field(s) of study (e.g., Engineering, Medicine, Computer Science, Arts) through general questions
    Determine if the student has a preferred geographical location (e.g., Ontario, specific countries, urban vs. rural settings
    Consider the student’s academic performance (GPA, standardized test scores) to recommend universities that match their qualifications
    Ask about the student’s preferences for campus culture (e.g.,extracurricular activities, diversity, environment)
    Factor in the student’s budget or need for financial aid, including scholarships, to suggest affordable options - find geographical location in order to know if its international pricing or a citizen’s pricing
    Understand the student’s long-term career goals to recommend universities with strong programs, internship opportunities, and industry connections in their desired field.
    Consider the student’s interest in university rankings and reputation, both overall and within specific programs.
    Ensure to check the application deadlines and requirements for each recommended university.
    Given a student’s preferred field of study, location preferences, academic performance, budget considerations, career goals, and additional preferences such as campus culture and language requirements, recommend a list of universities that best fit their needs. Include information about each university’s strengths in the relevant field, reputation, and any financial aid or scholarship options. Ensure that the recommendations are realistic based on the student’s academic background and provide insights into what the program might incite and how it’ll be, what sort of courses they’ll take and then what they will do in their career, use the given info in the prompt about the universities and their programs to decide which will be the best fit. Provide both the upsides and downsides for the user's consideration.

    Here is the important information on Ontario universities that you should recommend.
    1. Overall Academic Excellence
      - University of Toronto
      - University of Waterloo
      - McMaster University
      - Queen's University
      - Western University (University of Western Ontario)

    2. Engineering and Technology
      - University of Waterloo
      - University of Toronto
      - McMaster University
      - Queen's University
      - Ryerson University

    3. Computer Science
      - University of Waterloo
      - University of Toronto
      - McMaster University
      - Western University (University of Western Ontario)
      - Queen's University

    4. Business and Economics
      - University of Toronto (Rotman School of Management)
      - Western University (Ivey Business School)
      - Queen's University (Smith School of Business)
      - York University (Schulich School of Business)
      - McMaster University (DeGroote School of Business)

    5. Life/Health Sciences
      - University of Toronto
      - McMaster University
      - Western University (Schulich School of Medicine & Dentistry)
      - Queen's University
      - University of Ottawa

    6. Natural Sciences
      - University of Toronto
      - McMaster University
      - University of Waterloo
      - Western University
      - University of Ottawa

    7. Social Sciences and Management
      - University of Toronto
      - McMaster University
      - Queen's University
      - Western University
      - York University

    8. Arts and Humanities
      - University of Toronto
      - Queen's University
      - McMaster University
      - Western University
      - University of Ottawa

    9. Environmental Science
      - University of Toronto
      - University of Waterloo
      - Queen's University
      - Trent University
      - University of Guelph

    10. Law
      - University of Toronto (Faculty of Law)
      - Osgoode Hall Law School (York University)
      - Queen's University (Faculty of Law)
      - Western University (Faculty of Law)
      - University of Ottawa (Faculty of Law)

    11. Education
      - University of Toronto (Ontario Institute for Studies in Education - OISE)
      - Queen's University (Faculty of Education)
      - Western University (Faculty of Education)
      - York University (Faculty of Education)
      - Brock University (Faculty of Education)

    University of Toronto
    Field(s) of Study: Strong in Engineering, Computer Science, Business, Life Sciences, Natural Sciences, Social Sciences, Arts, Environmental Science, Law, Education.
    Location: Urban setting in Toronto, Ontario.
    Academic Performance: Very Competitive GPA and standardized test scores required. High academic achievement expected.
    Campus Culture: Diverse, with a large student body. Strong emphasis on research, extracurricular activities, and social justice initiatives.
    Budget/Financial Aid: High tuition, with financial aid available. International students face higher fees.
    Career Goals: Strong reputation with global connections, offering extensive internship and research opportunities.
    Rankings/Reputation: Consistently ranks as the top university in Canada across multiple fields.
    Application Deadlines: January 12 for international students, February 1 for domestic students.

    University of Waterloo
    Field(s) of Study: Best known for Engineering and Computer Science. Also strong in Environmental Science, Natural Sciences, and Mathematics.
    Location: Urban setting in Waterloo, Ontario.
    Academic Performance: Very High GPA, particularly in math and sciences for Engineering/CS. Co-op program requires competitive grades.
    Campus Culture: Strong co-op program, research opportunities, tech innovation hub.
    Budget/Financial Aid: Moderate to high tuition. Co-op program helps offset costs. International pricing is higher.
    Career Goals: Excellent for tech-related careers, strong industry connections, especially in Engineering and IT.
    Rankings/Reputation: Renowned for its Engineering and Computer Science programs.
    Application Deadlines: January 15 for most programs.

    McMaster University
    Field(s) of Study: Strong in Engineering, Medicine, Health Sciences, and Natural Sciences.
    Location: Urban setting in Hamilton, Ontario.
    Academic Performance: High GPA required, especially for Health Sciences and Engineering programs.
    Campus Culture: Collaborative learning environment, research-focused, smaller student body.
    Budget/Financial Aid: Moderate tuition, scholarships available. International students pay higher fees.
    Career Goals: Excellent for medical and research careers, strong co-op and internship programs.
    Rankings/Reputation: Highly ranked for Health Sciences and Medicine.
    Application Deadlines: February 1 for most programs.

    Queen's University
    Field(s) of Study: Strong in Business, Law, Engineering, Social Sciences, and Arts.
    Location: Urban setting in Kingston, Ontario.
    Academic Performance: High GPA and standardized test scores required.
    Campus Culture: Traditional and close-knit community, strong alumni network, vibrant campus life.
    Budget/Financial Aid: High tuition with scholarships available. International students face higher fees.
    Career Goals: Strong business and law programs with good placement rates and internships.
    Rankings/Reputation: Highly regarded for Business, Law, and Social Sciences.
    Application Deadlines: February 1 for most programs.

    Western University (University of Western Ontario)
    Field(s) of Study: Strong in Business, Law, Health Sciences, Engineering, and Social Sciences.
    Location: Urban setting in London, Ontario.
    Academic Performance: High GPA required, particularly for Business and Health Sciences.
    Campus Culture: Active student life, strong school spirit, large campus with a traditional atmosphere.
    Budget/Financial Aid: Moderate to high tuition, financial aid available. International students pay more.
    Career Goals: Strong for careers in Business, Law, and Health Sciences with good industry connections.
    Rankings/Reputation: Known for Business (Ivey) and Law.
    Application Deadlines: February 1 for most programs.

    Ryerson University
    Field(s) of Study: Best known for Engineering, Business, and Media Arts.
    Location: Urban setting in Toronto, Ontario.
    Academic Performance: Decently competitive GPA required, especially for Business and Engineering programs.
    Campus Culture: Focus on innovation and entrepreneurship, diverse student body, urban campus.
    Budget/Financial Aid: Moderate tuition, scholarships available. International students pay higher fees.
    Career Goals: Strong for careers in Engineering, Business, and Media with strong industry ties in Toronto.
    Rankings/Reputation: Known for innovative programs and industry connections.
    Application Deadlines: February 1 for most programs.

    York University
    Field(s) of Study: Strong in Business, Law, Social Sciences, and Arts.
    Location: Urban setting in Toronto, Ontario.
    Academic Performance: Competitive GPA required, especially for Business and Law.
    Campus Culture: Diverse and inclusive, large student body, urban campus with many commuter students.
    Budget/Financial Aid: Moderate to high tuition, financial aid available. International students face higher fees.
    Career Goals: Strong in Business and Law with good career placement and internships.
    Rankings/Reputation: Known for Social Sciences, Law (Osgoode), and Business (Schulich).
    Application Deadlines: February 1 for most programs.

    University of Ottawa
    Field(s) of Study: Strong in Law, Medicine, Social Sciences, and Engineering.
    Location: Urban setting in Ottawa, Ontario.
    Academic Performance: High GPA required, especially for Law and Medicine.
    Campus Culture: Bilingual (English/French), active student life, close connection to government institutions.
    Budget/Financial Aid: Moderate tuition with scholarships available. International students pay higher fees.
    Career Goals: Strong for careers in government, law, and healthcare, with internship opportunities.
    Rankings/Reputation: Highly regarded for Law and Social Sciences.
    Application Deadlines: February 1 for most programs.

    Trent University
    Field(s) of Study: Strong in Environmental Science, Social Sciences, and Humanities.
    Location: Rural setting in Peterborough, Ontario.
    Academic Performance: Moderate GPA required, supportive academic environment.
    Campus Culture: Small, close-knit community, strong emphasis on sustainability and environment.
    Budget/Financial Aid: Moderate tuition with scholarships available. International students face higher fees.
    Career Goals: Good for careers in environmental science, education, and community-focused fields.
    Rankings/Reputation: Known for Environmental Science and Humanities.
    Application Deadlines: February 1 for most programs.

    University of Guelph
    Field(s) of Study: Strong in Environmental Science, Agriculture, and Life Sciences.
    Location: Urban setting in Guelph, Ontario.
    Academic Performance: Moderate to high GPA required, especially for Agriculture and Life Sciences.
    Campus Culture: Friendly and collaborative, strong focus on sustainability and community involvement.
    Budget/Financial Aid: Moderate tuition with scholarships available. International students face higher fees.
    Career Goals: Strong for careers in environmental science, agriculture, and veterinary sciences.
    Rankings/Reputation: Known for Environmental Science, Agriculture, and Veterinary Sciences.
    Application Deadlines: February 1 for most programs.

    Brock University
    Field(s) of Study: Strong in Education, Business, and Health Sciences.
    Location: Urban setting in St. Catharines, Ontario.
    Academic Performance: Moderate GPA required, supportive academic environment.
    Campus Culture: Small to mid-sized campus, strong community focus, active student life.
    Budget/Financial Aid: Moderate tuition with scholarships available. International students pay higher fees.
    Career Goals: Good for careers in education, business, and health sciences.
    Rankings/Reputation: Known for Education and Business.
    Application Deadlines: February 1 for most programs.

    Please return one question at a time. Limit your response to 500 characters.

    Previous chat history is below. Make sure to consider previous inputs from the user.
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
    unpackedMessages+= '\nuser: '+message 
    console.log(unpackedMessages)

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
        <a onClick={() => setMessages([{ role: 'assistant', content: `Hello! I'm Alonzo, your personal assistant! Got any questions about your post-secondary future? I'm here to help!` }])}>Clear chat history</a>
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