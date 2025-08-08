"use server"

import {
  addBaseline,
  addSystem,
  addTag,
  deleteBaselineById,
  deleteSystemById,
  deleteTagById,
  mockActivity,
  rotateKey,
  updateBaselineById,
  updateSystemById,
  updateTagById,
} from "@/lib/store"

// Systems, baselines, tags
export async function createSystem(input: {
  name: string
  hostname: string
  tags: string[]
  selectedGlobalVars: string[]
}) {
  await addSystem(input)
}

export async function updateSystem(input: {
  id: string
  name: string
  hostname: string
  tags: string[]
  allowedVariables: string[]
}) {
  await updateSystemById(input)
}

export async function createBaseline(input: { name: string; variable: string; minVersion: string }) {
  await addBaseline(input)
}

export async function updateBaseline(input: { id: string; name: string; variable: string; minVersion: string }) {
  await updateBaselineById(input)
}

export async function deleteBaseline(id: string) {
  await deleteBaselineById(id)
}

export async function createTag(input: { name: string }) {
  await addTag(input.name)
}

export async function updateTag(input: { id: string; name: string }) {
  await updateTagById(input.id, input.name)
}

export async function deleteTag(id: string) {
  await deleteTagById(id)
}

export async function deleteSystem(id: string) {
  await deleteSystemById(id)
}

export async function rotateSystemApiKey(id: string) {
  return rotateKey(id)
}

export async function mockInboundActivity() {
  await mockActivity()
}

// Users (Settings) entfernt, da jetzt eigene API-Route genutzt wird
