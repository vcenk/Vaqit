"""
Synthetic athan audio generator using pure Python.
Produces two WAV files:
  - athan_fajr.wav   (~28s, full melody for Fajr)
  - athan.wav        (~20s, shorter melody for all other prayers)

Uses Hijaz maqam-inspired note sequences with vibrato and ADSR envelopes
to approximate an athan call.
"""
import struct, math, wave, os

SAMPLE_RATE = 44100
CHANNELS    = 1

# ── Frequency map (Hijaz maqam in D) ────────────────────────────────────────
NOTE = {
    'D4': 293.66,
    'Eb4': 311.13,
    'E4':  329.63,
    'F4':  349.23,
    'Fs4': 369.99,   # F#
    'G4':  392.00,
    'Ab4': 415.30,
    'A4':  440.00,
    'Bb4': 466.16,
    'B4':  493.88,
    'C5':  523.25,
    'Cs5': 554.37,
    'D5':  587.33,
    'Eb5': 622.25,
    'E5':  659.25,
    'F5':  698.46,
    'Fs5': 739.99,
    'G5':  783.99,
}

def sine_wave(freq, duration, sample_rate=SAMPLE_RATE,
              vibrato_rate=5.5, vibrato_depth=0.012,
              attack=0.06, decay=0.05, sustain=0.85, release=0.12,
              volume=0.55):
    """Generate one note with vibrato and ADSR envelope."""
    n = int(sample_rate * duration)
    samples = []
    attack_s  = int(sample_rate * attack)
    decay_s   = int(sample_rate * decay)
    release_s = int(sample_rate * release)

    for i in range(n):
        t = i / sample_rate
        # ADSR envelope
        if i < attack_s:
            env = i / attack_s
        elif i < attack_s + decay_s:
            env = 1.0 - (i - attack_s) / decay_s * (1.0 - sustain)
        elif i >= n - release_s:
            env = sustain * (n - i) / release_s
        else:
            env = sustain
        # Vibrato
        vib = 1.0 + vibrato_depth * math.sin(2 * math.pi * vibrato_rate * t)
        s = env * volume * math.sin(2 * math.pi * freq * vib * t)
        # Add subtle harmonics for richness
        s += env * volume * 0.25 * math.sin(2 * math.pi * freq * 2 * vib * t)
        s += env * volume * 0.08 * math.sin(2 * math.pi * freq * 3 * vib * t)
        # Clamp
        s = max(-1.0, min(1.0, s))
        samples.append(int(s * 32767))
    return samples

def glide(f1, f2, duration, sample_rate=SAMPLE_RATE,
          vibrato_rate=5.5, vibrato_depth=0.010,
          attack=0.04, release=0.10, volume=0.50):
    """Glide (portamento) from f1 to f2 over duration seconds."""
    n = int(sample_rate * duration)
    release_s = int(sample_rate * release)
    attack_s  = int(sample_rate * attack)
    samples = []
    for i in range(n):
        t = i / sample_rate
        progress = i / n
        freq = f1 + (f2 - f1) * progress
        if i < attack_s:
            env = i / attack_s
        elif i >= n - release_s:
            env = 0.8 * (n - i) / release_s
        else:
            env = 0.8
        vib = 1.0 + vibrato_depth * math.sin(2 * math.pi * vibrato_rate * t)
        s = env * volume * math.sin(2 * math.pi * freq * vib * t)
        s += env * volume * 0.25 * math.sin(2 * math.pi * freq * 2 * vib * t)
        s = max(-1.0, min(1.0, s))
        samples.append(int(s * 32767))
    return samples

def silence(duration, sample_rate=SAMPLE_RATE):
    return [0] * int(sample_rate * duration)

def note(name, dur, **kw):
    return sine_wave(NOTE[name], dur, **kw)

def g(n1, n2, dur, **kw):
    return glide(NOTE[n1], NOTE[n2], dur, **kw)

def build_athan_short():
    """
    ~20s athan melody for Dhuhr/Asr/Maghrib/Isha (iOS ≤30s limit).
    Melodic pattern inspired by Hijaz maqam.
    """
    parts = []

    # --- Allahu Akbar (x2 quick, rising) ---
    for _ in range(2):
        parts += g('D4', 'G4', 0.40)
        parts += note('G4', 0.55)
        parts += g('G4', 'A4', 0.35)
        parts += note('A4', 0.45)
        parts += silence(0.12)
        parts += g('A4', 'G4', 0.30)
        parts += note('G4', 0.25)
        parts += g('G4', 'D4', 0.40)
        parts += silence(0.18)

    # --- Ashhadu (declaration x1 condensed) ---
    parts += note('Fs4', 0.30)
    parts += g('Fs4', 'A4', 0.35)
    parts += note('A4', 0.50)
    parts += g('A4', 'Bb4', 0.25)
    parts += note('Bb4', 0.40)
    parts += g('Bb4', 'G4', 0.40)
    parts += note('G4', 0.30)
    parts += silence(0.15)

    # --- Hayya alas-salah (come to prayer) ---
    parts += note('Bb4', 0.30)
    parts += g('Bb4', 'G4', 0.35)
    parts += note('G4', 0.25)
    parts += g('G4', 'A4', 0.30)
    parts += note('A4', 0.45)
    parts += g('A4', 'G4', 0.30)
    parts += note('G4', 0.20)
    parts += silence(0.20)

    # --- Hayya alal-falah (come to success) ---
    parts += note('A4', 0.25)
    parts += g('A4', 'Bb4', 0.30)
    parts += note('Bb4', 0.35)
    parts += g('Bb4', 'G4', 0.40)
    parts += note('G4', 0.25)
    parts += silence(0.15)

    # --- Allahu Akbar (closing, x2 sustained) ---
    for _ in range(2):
        parts += g('D4', 'G4', 0.35)
        parts += note('G4', 0.65)
        parts += g('G4', 'A4', 0.30)
        parts += note('A4', 0.50)
        parts += g('A4', 'D4', 0.45)
        parts += silence(0.15)

    # --- La ilaha illa Allah (final, resolving down) ---
    parts += note('G4', 0.30)
    parts += g('G4', 'A4', 0.25)
    parts += note('A4', 0.40)
    parts += g('A4', 'G4', 0.35)
    parts += note('G4', 0.30)
    parts += g('G4', 'D4', 0.55)
    parts += silence(0.30)

    return parts

def build_athan_fajr():
    """
    ~28s Fajr athan — same base + extra Fajr phrase "As-salatu khayrun min an-nawm".
    """
    parts = build_athan_short()

    # --- As-salatu khayrun min an-nawm (prayer is better than sleep) x2 ---
    for _ in range(2):
        parts += silence(0.20)
        parts += note('Bb4', 0.30)
        parts += g('Bb4', 'A4', 0.30)
        parts += note('A4', 0.45)
        parts += g('A4', 'G4', 0.35)
        parts += note('G4', 0.25)
        parts += g('G4', 'Fs4', 0.40)
        parts += note('Fs4', 0.35)
        parts += g('Fs4', 'D4', 0.45)
        parts += silence(0.15)

    return parts

def write_wav(path, samples):
    peak = max(abs(s) for s in samples) if samples else 1
    # Normalize to 90% of full scale
    scale = int(32767 * 0.90)
    if peak > 0:
        normalized = [int(s * scale / peak) for s in samples]
    else:
        normalized = samples
    
    with wave.open(path, 'w') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(SAMPLE_RATE)
        data = struct.pack(f'<{len(normalized)}h', *normalized)
        wf.writeframes(data)
    
    duration = len(samples) / SAMPLE_RATE
    size_kb = os.path.getsize(path) / 1024
    print(f"Wrote {path}: {duration:.1f}s, {size_kb:.0f} KB")

if __name__ == '__main__':
    os.makedirs('artifacts/mobile/assets/sounds', exist_ok=True)
    
    print("Generating athan.wav (short, for Dhuhr/Asr/Maghrib/Isha)...")
    short = build_athan_short()
    write_wav('artifacts/mobile/assets/sounds/athan.wav', short)
    
    print("Generating athan_fajr.wav (with Fajr-specific phrase)...")
    fajr = build_athan_fajr()
    write_wav('artifacts/mobile/assets/sounds/athan_fajr.wav', fajr)
    
    print("Done.")
