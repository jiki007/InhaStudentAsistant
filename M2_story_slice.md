# M2_story_slice.md

## Worksheet 1 of 2: Context and Story 1

**Team / product / members / date**
* Team 10 /Product: InhaAssist
* Members: Zikrilloh, Tuymurod
* Date: 2026-09-27

**M1 input: user and problem; feedback received or "No feedback yet"**
* User: English-speaking international students at Inha University.
* Problem: The Korean-only official portal is hard to navigate and breaks layout when auto-translated on mobile. 
* Feedback: No feedback yet.

**One revision or decision to retain the current direction, with a reason**
* Decision: Retain the current direction.
* Reason: The problem stems from our own solid, personal experiences as freshmen, making it a highly valid and verifiable pain point to address first.

**User profile: role, relevant situation, skill or constraint**
* Role: International student (freshman).
* Situation: Navigating the campus on foot between classes with a mobile phone.
* Constraint: Limited Korean language proficiency and limited time before class starts.

**Evidence source, or clearly labeled assumption**
* Evidence Source: Direct team observation and personal experience.

**Scenario: situation, core task, and expected benefit (2-3 sentences)**
The user has 10 minutes to reach their next class located in a building listed only as "60주년기념관" on their schedule. They use their mobile phone to quickly search this building code in English. The expected benefit is instantly finding the physical building on an English map without dealing with distorted auto-translated text.

**S1 First core story**
* **Story:** As an international student, I want to search for a campus building by its official code or name in English, so that I can pinpoint its physical location on the campus map.
* **Priority and rationale:** High priority. Locating the building is the foundational step before finding a specific room. 
* **Dependency:** Requires the compiled English-Korean building code database.

**Acceptance Criteria for S1**
* **Criterion S1-AC1:** Given the user is on the main search screen, when they type "60th Anniversary" and submit, the system displays a map with a pin on the correct physical building.
* **Criterion S1-AC2:** Given the user is on the search screen, when they enter an unrecognized building code (e.g., "XYZ99") and submit, the system displays an "Unrecognized building code" error message.

---

## Worksheet 2 of 2: Story 2 and Team Review

**S2 Second core story**
* **Story:** As an international student, I want to view a specific building's floor directory in English, so that I know exactly which floor my assigned classroom or professor's office is on.
* **Priority and rationale:** High priority. Finding the building is only half the problem; students also get lost inside without English floor directories.
* **Dependency:** Depends on S1 (must locate or select a building first).

**Acceptance Criteria for S2**
* **Criterion S2-AC1:** Given the user has selected a specific building on the map, when they tap the "View Directory" button, the system displays a vertical, floor-by-floor list of rooms in English.
* **Criterion S2-AC2:** Given the user is viewing a building's floor directory, when they type a room number (e.g., "302") in the directory filter, the system filters the list to display only the matching room and its floor.

**One alternate/invalid case covered, or one rule still needing agreement**
* Rule still needing agreement: If a building's internal floor data has not been successfully scraped yet, do we hide the "View Directory" button entirely, or show a disabled button that says "Data unavailable for this building"?

**One capability excluded from this slice, with a reason**
* Excluded: Real-time GPS indoor routing (e.g., showing a blue dot moving down a hallway).
* Reason: Too technically complex for V1; requires advanced indoor positioning infrastructure.

**Review the document, then save it**
* [O] Both stories relate to the same stated user task and scenario.
* [O] Each criterion has a result another person could inspect.
* [O] Assumptions, agreed draft rules, and open questions are distinguishable.
* [O] The document describes expected behavior without inventing test results.

**Reviewer; ambiguity found; change made (or reason no change was needed)**
* Reviewer: Tuymurod
* Ambiguity found: "Map" in S1 was ambiguous (is it Google Maps, Kakao, or custom?). 
* Change made: Left as "map" in the story to keep it user-focused, but noted Kakao Maps API integration in our technical notes.

**Saved file/location or commit link; person who reopened and checked it**
* File: `M2_story_slice.md` saved in GitHub repo. link: https://github.com/jiki007/InhaStudentAsistant
* Checked by: [Tuymurod]

**AI use**
* AI Use: Used Google Gemini to assist in drafting acceptance criteria formats and formulating the markdown document based on our M1 context.