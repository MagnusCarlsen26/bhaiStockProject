Based on the screenshots provided, the design language is **"Modern Material Masonry."** It focuses on high readability, soft pastel color coding, card-based organization (staggered grid), and bottom-heavy navigation for one-handed use.

Here is the updated UI/UX Design Document. I have integrated the visual style from the images into the Stock Reminder App requirements.

***

# Stock Reminder App – UI/UX Design Specification & Feature Update

## 1. Design Philosophy & Visual Language

*   **Vibe:** Playful yet productive, clean, and minimalist.
*   **Layout Structure:** Staggered Grid (Masonry) Layout. This breaks away from rigid table rows, making the app feel more like a personal dashboard than a spreadsheet.
*   **Color Palette (Pastel/Matte):**
    *   Cards should use distinct matte colors for quick visual recognition.
    *   *Primary Accents:* Sunset Orange (`#FFB74D`), Soft Pink (`#F48FB1`), Teal (`#4DB6AC`), Sky Blue (`#64B5F6`), Lavender (`#B39DDB`).
    *   *Background:* Clean Off-White (`#FAFAFA`) or very light Pale Pink (`#FFF0F5` - based on screenshot background).
    *   *Text:* Dark Grey (`#333333`) for headings, Medium Grey (`#666666`) for metadata.
*   **Typography:** Sans-serif, rounded friendly fonts (e.g., Product Sans, Poppins, or Roboto Rounded). Bold headings, airy line spacing.
*   **Corner Radius:** Heavy rounding on cards (approx. 16dp to 24dp).

---

## 2. Screen-by-Screen UI/UX Breakdown

### A. Home Dashboard (The "Staggered Grid")
*Reference: Screenshot 1 & 4*

*   **Header:**
    *   Top Left: "Stock Lists" (Large, Bold Title).
    *   Top Right: Toggle View Icon (Grid/List) and Settings Gear icon.
*   **Main Content:**
    *   A **Masonry Grid** displaying the 5 Core Schedule Categories as individual cards.
    *   **Card Appearance:**
        *   **Daily Checklist:** Sunset Orange Card.
        *   **Rolling 3-Day:** Sky Blue Card.
        *   **Weekly:** Soft Pink Card.
        *   **15 Days:** Teal Card.
        *   **Monthly:** Lavender Card.
    *   **Card Content (What’s on the tile):**
        *   **Title:** e.g., "Daily Checklist".
        *   **Preview Text:** Instead of "lorem ipsum," this shows a summary of pending items. (e.g., *"Milk, Bread + 3 others pending"*).
        *   **Status Badge/Pill:** A small pill-shaped tag showing the next reset date (e.g., "Resets Midnight").
        *   **Progress Ring (New Feature):** A subtle visual indicator (like a small circular progress bar in the corner of the card) showing completion % (e.g., 50% done).
*   **Bottom Navigation:**
    *   **Floating Action Button (FAB):** A large, white button with a generic colored "Plus" (+) icon floating above the bottom bar.
    *   **Search Bar:** A floating pill-shaped search bar at the very bottom (as seen in screenshots) containing a "Menu" hamburger icon (left) and "Search" icon (right).

### B. Detailed Checklist View (Inside a Card)
*Reference: Screenshot 2 (Edit Note Screen)*

*   **Transition:** Tapping a card on the dashboard expands it (Hero transition) into a full-screen view matching the color of the card.
*   **Layout:**
    *   **Title:** Large text at the top (e.g., "Weekly Checklist").
    *   **The List:** Below the title, the items appear as a clean list.
    *   **Item Row UI:**
        *   **Left:** A large, friendly Checkbox.
        *   **Middle:** Item Name (e.g., "Rice") and Unit (e.g., "kg").
        *   **Right:** A numeric input field. It should look like a "pill" that the user taps to type, or has small +/- stepper buttons.
*   **Interaction:**
    *   Checking the box moves the item to a "Completed" section at the bottom (crossed out).
    *   Unchecking brings it back up.
*   **Auto-Save:** No "Save" button is needed for the list; it saves on back-press.

### C. Master Item & Category Management (The "Settings" Flow)
*Reference: Screenshot 3 (Categories)*

*   **Access:** Accessed via the Settings Gear or the Bottom Menu.
*   **UI:** A list of folders/cards representing the categories.
*   **Manage Items:**
    *   User selects a category (e.g., "Daily").
    *   They see a list of all *possible* items for that category.
    *   They can swipe left to delete an item.
    *   They can drag-and-drop to reorder priority.

### D. The "Add New" Experience
*Reference: Screenshot 5 (Move to Category Bottom Sheet)*

*   **Trigger:** Tapping the big **+** FAB on the Home Screen.
*   **Action:** Opens a **Bottom Sheet Dialog** with rounded top corners.
*   **Content:**
    *   Input field: "Item Name".
    *   Input field: "Unit" (Dropdown or predictive text).
    *   **"Assign to Schedule" Selection:** A list of the 5 categories with radio buttons (similar to the "Move to category" UI in the screenshot).
    *   **Button:** Large "Add Item" button.

### E. Reports & Selection Mode
*Reference: Screenshot 4 & 7 (Selection Overlay)*

*   **Selection Mode:** Long-pressing a card on the Dashboard dims the background and puts a checkmark on the selected card.
*   **Action Bar:** Once selected, top icons appear: *Delete (disabled for core lists), Share/Export, View Report.*
*   **Report UI:**
    *   When "Report" is clicked, a clean modal appears.
    *   Displays a simple bar chart or list summarizing the "Total Quantity" for the selected category based on the filter (Last Month/Year).

---

## 3. Updated Feature Requirements (Based on UX)

To support this specific UI, the following technical requirements are updated:

1.  **Search Bar Placement:** The search functionality is no longer a top-right icon. It is now a **persistent bottom bar**.
    *   *Behavior:* Typing in this bar searches for *items* across all categories (e.g., typing "Milk" shows "Milk" in the Daily card).
2.  **Summary/Preview Logic:** The system must calculate a "preview string" for the Dashboard cards.
    *   *Logic:* Identify the top 2 un-checked items and display them on the card face (e.g., "Eggs, Butter...").
3.  **Selection Mode:** Implementing the "Long Press" state on the Dashboard is now a requirement to access bulk features like Exporting specific category reports.
4.  **Transitions:** The app must implement "Shared Element Transitions." When a user taps the Orange "Daily" card, the background should flood fill with that orange color as it opens the detail screen.

## 4. Summary of User Journey

1.  **Open App:** User sees a beautiful grid of 5 pastel cards.
2.  **Check Status:** At a glance, the "Daily" card says "3 items pending."
3.  **Action:** User taps the "Daily" card.
4.  **Fill Checklist:** The screen opens. User ticks "Milk" and types "2" in the quantity box.
5.  **Finish:** User swipes back or taps the back arrow.
6.  **Review:** The "Daily" card on the dashboard now updates to say "All done!" with a full progress ring.
7.  **Add New:** User bought something new? Tap the **+**, type "Ginger," select "Weekly," and tap Save.
