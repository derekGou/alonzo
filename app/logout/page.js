"use client"

import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material"
import { useState, useRef, useEffect, isValidElement } from "react"
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebase'
import MarkdownView from 'react-showdown';
import Link from "next/link";

export default function logOut() {
    const logOut = async () => {
        localStorage.setItem('loggedIn', '')
        window.location.href=window.location.href.slice(0, -7)
    }
    logOut()
    return (
        <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={4}
        />
    )
}