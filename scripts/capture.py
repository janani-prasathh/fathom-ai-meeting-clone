#!/usr/bin/env python3
"""
Agent Capture Script for Antigravity IDE
Captures raw prompt and final response for each turn, formatting according to
the 8x assignment specification.
"""

import sys
import os
import json
import glob
import time
import getpass
import datetime
import subprocess
import sqlite3

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGS_DIR = os.path.join(REPO_DIR, ".agent-logs")
BRAIN_DIR = os.path.expanduser("~/.gemini/antigravity-ide/brain")
CONVERSATIONS_DIR = os.path.expanduser("~/.gemini/antigravity-ide/conversations")
DEFAULT_AUTHOR = "jananip"
PROJECT_NAME = "fanthom_clone"
DEFAULT_TOOL = "antigravity"
DEFAULT_MODEL = "gemini-3.8-flash"


def get_git_author():
    try:
        author = subprocess.check_output(
            ["git", "config", "user.name"],
            cwd=REPO_DIR,
            stderr=subprocess.DEVNULL
        ).decode().strip()
        if author:
            return author
    except Exception:
        pass
    try:
        return getpass.getuser()
    except Exception:
        return DEFAULT_AUTHOR


def extract_prompt_text(raw_content):
    if not raw_content:
        return ""
    if "<USER_REQUEST>" in raw_content:
        parts = raw_content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0]
        if parts.startswith("\r\n"):
            parts = parts[2:]
        elif parts.startswith("\n"):
            parts = parts[1:]
        if parts.endswith("\r\n"):
            parts = parts[:-2]
        elif parts.endswith("\n"):
            parts = parts[:-1]
        return parts
    return raw_content


def detect_model_name(lines, default_model=DEFAULT_MODEL):
    current_model = default_model
    for line in lines:
        content = line.get("content", "")
        if "<USER_SETTINGS_CHANGE>" in content:
            if "Gemini 3.8 Flash" in content:
                current_model = "gemini-3.8-flash"
            elif "Gemini 3.8 Pro" in content:
                current_model = "gemini-3.8-pro"
    return current_model


def is_workspace_session(session_id, transcript_lines):
    # Method 1: Check SQLite database
    db_path = os.path.join(CONVERSATIONS_DIR, f"{session_id}.db")
    if os.path.exists(db_path):
        try:
            con = sqlite3.connect(db_path)
            cur = con.cursor()
            cur.execute("SELECT data FROM trajectory_metadata_blob WHERE id = 'main'")
            row = cur.fetchone()
            con.close()
            if row and row[0] and b"fanthom_clone" in row[0]:
                return True
        except Exception:
            pass

    # Method 2: Check lines in transcript for workspace path
    for line in transcript_lines:
        content = json.dumps(line)
        if "fanthom_clone" in content:
            return True

    return False


def parse_session_transcript(transcript_path):
    if not os.path.exists(transcript_path):
        return None

    session_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(transcript_path))))
    if not session_id or len(session_id) < 8:
        return None

    lines = []
    with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
        for raw_line in f:
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                lines.append(json.loads(raw_line))
            except json.JSONDecodeError:
                continue

    if not lines:
        return None

    if not is_workspace_session(session_id, lines):
        return None

    model_name = detect_model_name(lines, DEFAULT_MODEL)

    user_indices = [
        i for i, step in enumerate(lines)
        if step.get("type") == "USER_INPUT" and step.get("source") == "USER_EXPLICIT"
    ]

    turns = []
    for idx_num, u_idx in enumerate(user_indices):
        user_step = lines[u_idx]
        next_u_idx = user_indices[idx_num + 1] if idx_num + 1 < len(user_indices) else len(lines)
        turn_steps = lines[u_idx:next_u_idx]

        prompt_raw = user_step.get("content", "")
        prompt_text = extract_prompt_text(prompt_raw)
        prompt_time = user_step.get("created_at")

        response_text = None
        response_time = None

        responses = [
            s for s in turn_steps
            if s.get("type") == "PLANNER_RESPONSE" and s.get("source") == "MODEL"
        ]

        for s in reversed(responses):
            content = s.get("content")
            tc = s.get("tool_calls")
            if content and not tc:
                response_text = content
                response_time = s.get("created_at")
                break

        if not response_text:
            err_steps = [s for s in turn_steps if s.get("type") == "ERROR_MESSAGE"]
            if err_steps:
                response_text = str(err_steps[-1].get("content", "Error during execution"))
                response_time = err_steps[-1].get("created_at", prompt_time)

        turns.append({
            "num": idx_num + 1,
            "prompt": prompt_text,
            "prompt_time": prompt_time,
            "response": response_text,
            "response_time": response_time,
            "model": model_name
        })

    return {
        "session_id": session_id,
        "turns": turns,
        "model": model_name
    }


def format_session_log(session_data):
    session_id = session_data["session_id"]
    short_id = session_id[:8] if len(session_id) >= 8 else session_id
    turns = session_data["turns"]
    author = get_git_author()
    model = session_data["model"]

    if not turns:
        return None

    first_prompt_time = turns[0]["prompt_time"] or datetime.datetime.now(datetime.timezone.utc).isoformat()
    last_prompt_time = turns[-1]["prompt_time"] or first_prompt_time

    date_str = first_prompt_time[:10]
    completed_turns = [t for t in turns if t["response"] is not None]
    total_exchanges = len(completed_turns)

    output = []
    output.append("---")
    output.append(f"session_id: {session_id}")
    output.append(f"date: {date_str}")
    output.append(f"author: {author}")
    output.append(f"model: {model}")
    output.append(f"tool: {DEFAULT_TOOL}")
    output.append(f"project: {PROJECT_NAME}")
    output.append(f"total_exchanges: {total_exchanges}")
    output.append(f"first_prompt_time: {first_prompt_time}")
    output.append(f"last_prompt_time: {last_prompt_time}")
    output.append("---")
    output.append("")
    output.append(f"# Session Log - {date_str}")
    output.append("")
    output.append(f"Session: `{short_id}` | Project: `{PROJECT_NAME}` | Author: `{author}`")
    output.append("")
    output.append("---")
    output.append("")

    for t in turns:
        t_num = t["num"]
        t_model = t["model"]
        t_prompt_time = t["prompt_time"] or first_prompt_time
        t_prompt = t["prompt"]

        output.append(f"[LOG_ENTRY type=PROMPT num={t_num} session={short_id}]")
        output.append(f"timestamp: {t_prompt_time}")
        output.append(f"model: {t_model}")
        output.append("")
        output.append(t_prompt)
        output.append("")
        output.append("")

        if t["response"] is not None:
            t_resp_time = t["response_time"] or t_prompt_time
            output.append(f"[LOG_ENTRY type=RESPONSE num={t_num} session={short_id}]")
            output.append(f"timestamp: {t_resp_time}")
            output.append(f"model: {t_model}")
            output.append("")
            output.append(t["response"])
            output.append("")
            output.append("")

    return "\n".join(output).rstrip() + "\n"


def sync_transcript_to_log(transcript_path):
    data = parse_session_transcript(transcript_path)
    if not data or not data["turns"]:
        return None

    session_id = data["session_id"]
    first_time_str = data["turns"][0]["prompt_time"] or datetime.datetime.now(datetime.timezone.utc).isoformat()
    clean_ts = first_time_str.split(".")[0].replace("Z", "").replace(":", "-").replace("T", "_")

    filename = f"{clean_ts}_{session_id}.md"
    target_path = os.path.join(LOGS_DIR, filename)

    content = format_session_log(data)
    if not content:
        return None

    os.makedirs(LOGS_DIR, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)

    return target_path


def sync_all_sessions():
    search_pattern = os.path.join(BRAIN_DIR, "*", ".system_generated", "logs", "transcript_full.jsonl")
    matched = glob.glob(search_pattern)
    synced = []
    for p in matched:
        res = sync_transcript_to_log(p)
        if res:
            synced.append(res)
    return synced


def run_watcher():
    """Continuously watches for changes in transcripts and syncs them."""
    print("Agent capture watcher running...", flush=True)
    last_mtimes = {}

    while True:
        try:
            search_pattern = os.path.join(BRAIN_DIR, "*", ".system_generated", "logs", "transcript_full.jsonl")
            for p in glob.glob(search_pattern):
                try:
                    mtime = os.path.getmtime(p)
                except OSError:
                    continue
                if p not in last_mtimes or mtime > last_mtimes[p]:
                    last_mtimes[p] = mtime
                    sync_transcript_to_log(p)
        except Exception:
            pass
        time.sleep(1)


def handle_hook_input():
    """Handles invocation from hooks.json."""
    # Print empty object to stdout immediately so hook does not block
    print(json.dumps({}), flush=True)

    input_data = {}
    # Read stdin non-blockingly if available
    try:
        import select
        if select.select([sys.stdin], [], [], 0.05)[0]:
            raw = sys.stdin.read()
            if raw.strip():
                input_data = json.loads(raw)
    except Exception:
        pass

    transcript_path = input_data.get("transcriptPath")
    if transcript_path:
        full_path = transcript_path.replace("transcript.jsonl", "transcript_full.jsonl")
        if os.path.exists(full_path):
            sync_transcript_to_log(full_path)
            return

    sync_all_sessions()


if __name__ == "__main__":
    if "--watch" in sys.argv or "--daemon" in sys.argv:
        run_watcher()
    elif "--hook" in sys.argv:
        handle_hook_input()
    else:
        results = sync_all_sessions()
        for r in results:
            print(f"Synced: {r}")
