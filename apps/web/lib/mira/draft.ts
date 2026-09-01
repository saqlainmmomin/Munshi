import Anthropic from "@anthropic-ai/sdk";
import type { Listing, ThreadPurpose } from "@/lib/types";

// Mira — the AI concierge (PRD §9). She DRAFTS; Saqlain approves & sends.
// Guardrails (AGENTS.md §7.4):
//  - The first outbound message in a thread MUST disclose she is an AI.
//  - Nothing is auto-sent in the pilot — every draft goes to the operator queue.

const client = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface DraftInput {
  listing: Listing;
  purpose: ThreadPurpose;      // 'qualify' | 'auto_verify'
  isFirstMessage: boolean;     // drives the AI disclosure
}

export interface DraftedMessage {
  body: string;
  disclosesAi: boolean;        // persisted to qualification_messages.discloses_ai
}

/** Draft one outbound WhatsApp message for the operator to review. */
export async function draftOutreach(input: DraftInput): Promise<DraftedMessage> {
  // TODO: build the prompt from the listing + purpose. For 'auto_verify',
  // ask ONLY for the missing facts (listing.missing_fields). For 'qualify',
  // confirm availability + arrange a visit.
  void client; // wired up when the prompt is implemented
  void input;
  throw new Error("TODO: implement Mira drafting (PRD §9). Must disclose AI on first message.");
}
