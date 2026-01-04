"use client"

import React from 'react'
import Timeline from "@/components/timeline"
import { Navbar } from '@/components/ui/Resizable-navbar'
import NavigationPanel from '@/components/ui/NavigationPanel'
import Footer from '@/components/ui/Footer'

export default function page() {
  return (
    <div>
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>
      <div className="mt-12.5">
        <Timeline />
      </div>
      <Footer />
    </div>
  )
}
