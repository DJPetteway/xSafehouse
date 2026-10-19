# Live Clipper: real-time stream clipping agent

**Goal:** while a creator is live, automatically find the moments worth clipping, cut them
into vertical shorts with captions, and queue them up ready to post. When the stream ends,
the creator reviews a stack of finished posts instead of a 4-hour VOD.

## Why it fits Safehouse

- Clipping is the most painful repeatable job in streaming. Most creators either pay an
  editor or skip it entirely.
- It's the clearest "agent does the boring part" story, so it's a strong flagship for the
  Studio button on the landing page.
- The community feeds it: members can upvote clips in Discord, and that signal tunes what
  the agent picks next time.

## How it works

```
 Twitch / YouTube / Kick live
          │  (HLS pull or RTMP fan-out)
          ▼
 ┌──────────────────┐   rolling 10-min buffer on disk
 │  Ingest worker   │──────────────────────────────┐
 └──────────────────┘                              │
          │ audio + chat + events                  │
          ▼                                        │
 ┌──────────────────┐   ┌───────────────────────┐  │
 │ Signal detectors │──▶│ Moment scorer (agent) │  │
 │ • chat velocity  │   │ ranks candidates,     │  │
 │ • audio loudness │   │ picks in/out points,  │  │
 │ • live transcript│   │ writes title + hook   │  │
 │ • subs/raids/bits│   └───────────────────────┘  │
 │ • manual !clip   │              │               │
 └──────────────────┘              ▼               │
                         ┌──────────────────┐      │
                         │  Cutter (ffmpeg) │◀─────┘
                         │ • 9:16 reframe   │
                         │ • burned captions│
                         │ • 16:9 original  │
                         └──────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────┐
                    │  Post queue               │
                    │ per-platform caption,     │
                    │ hashtags, suggested time  │
                    │ → approve / edit / skip   │
                    └───────────────────────────┘
                                   │
            YouTube Shorts · TikTok · IG Reels · X · Discord #clips
```

### Signals (cheap first, smart second)

1. **Hard triggers:** `!clip` from the streamer or mods, raids, big donations, sub trains.
   Always clip these.
2. **Heuristics:** chat messages-per-second spikes, emote floods (`LUL`, `KEKW`, `W`),
   audio loudness jumps. Cheap, and they run on every second of the stream.
3. **Agent pass:** every ~60s, send the latest transcript window plus the heuristic peaks
   to Claude. It decides whether there's a real moment, where it starts and ends (clean
   sentence boundaries), and writes a title or hook. This keeps model cost proportional
   to the number of candidate moments, not to stream length.

### Output per clip

- Vertical 9:16 (face-cam stacked over gameplay, or a smart crop) and the 16:9 original
- Word-level burned-in captions in a Safehouse caption style
- A title, a hook line, and captions and hashtags tailored to each platform
- A suggested posting time, based on the creator's audience timezone (we're international)

### Posting

- **Default: human approves.** The queue lives in the Studio web app and is mirrored to a
  private Discord channel with ✅ / ✏️ / ❌ reactions.
- Auto-post per platform where the APIs allow it: the YouTube Data API for Shorts, and the
  TikTok Content Posting API (needs app review). The Instagram Graph API needs a business
  account.

## MVP scope (recommended order)

1. **VOD mode first:** run the same pipeline on a finished VOD. It's the same detectors and
   cutter with no real-time complexity, and it gets clips to creators within weeks.
2. **Live mode:** Twitch first (EventSub plus chat via IRC are easy). YouTube Live chat via
   the API comes second.
3. **Post queue and Discord approvals.**
4. **Auto-posting:** YouTube first, then TikTok once the app review is approved.

## Suggested stack

- Workers: Python with ffmpeg, `streamlink` for HLS pulls, and faster-whisper for live
  transcription (GPU box or a hosted STT)
- Agent: the Claude API with tool use (`propose_clip`, `write_caption`, `schedule_post`)
- Queue and storage: Postgres, plus S3/R2 for media
- App: Next.js dashboard and a Discord bot (discord.js) for approvals

## Open questions

- Pricing: free for Safehouse members, paid for outside creators?
- Hosting cost of real-time transcription per concurrent stream
- Consent: clips of guests or collab partners may need their approval before posting
