import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MotionPathPlugin, DrawSVGPlugin, useGSAP)

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }

const rm = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
export const prefersReduced = () => !!rm?.matches
export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
