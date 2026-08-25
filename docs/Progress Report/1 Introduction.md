# 1. Introduction

Transcribing Bengali audio from YouTube videos presents a unique set of challenges. Bengali is a morphologically rich language, and the content on YouTube often features varying accents, background noise, multiple speakers, and domain-specific vocabulary.

This project aims to build an efficient, highly accurate, and scalable timestamped transcription pipeline specifically tailored for Bengali YouTube videos. 

To achieve this, we evaluate several state-of-the-art automatic speech recognition (ASR) models based on the Whisper architecture. We focus heavily on minimizing Word Error Rate (WER) and Character Error Rate (CER), optimizing inference speed, and effectively handling the intricacies of the Bengali language.

This progress report documents the journey from collecting a robust testing dataset to evaluating open-source models, and finally identifying the best-performing model for our use case.
