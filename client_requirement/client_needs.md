# Stock Reminder App – Updated Requirement Document

## 1. Purpose
(Same as original)

## 2. Core Features

### a) Master Item Management (New Section)
*   A **"Settings"** or **"Manage Items"** screen is required.
*   User can **Add, Edit, or Delete** stock items.
*   When adding an item, the user must specify:
    1.  **Item Name** (e.g., Milk)
    2.  **Category** (Daily, Weekly, etc.)
    3.  **Unit of Measure** (e.g., kg, liters, pcs, boxes)

### b) Dashboard & Categories
The app should have 5 main categories (boxes):
1.  **Daily Checklist**
2.  **Twice Weekly** (Fixed on Mon & Thu) **OR** **Rolling 3-Day Checklist** (Please specify preferred logic)
3.  **Weekly Checklist**
4.  **15 Days Checklist**
5.  **Monthly Checklist**

### c) Checklist Functionality
*   Each checklist box contains the list of stock items assigned to that category.
*   Each item has a checkbox and a number input field.
*   User can edit the quantity anytime before the list resets.
*   The input field should display the **Unit of Measure** defined in the Master List (e.g., "10 [kg]").

### d) Reset Logic (Crucial Update)
*   **Reset Time:** All resets happen at 00:00 (Midnight) local time.
*   **Auto-Zero:** At 00:00, if an item was not ticked/filled, the system saves "0" to the report history before resetting.
*   **Schedules:**
    *   **Daily list** → Resets every night.
    *   **3–4 Days list** → Resets every 3 days (based on day of year).
    *   **Weekly list** → Resets every Monday at 00:00.
    *   **15 Days list** → Resets on the 1st and 16th of every month.
    *   **Monthly list** → Resets on the 1st of every month.

### e) Reports
*   **Date Filter:** User can select a date range (e.g., "Last Month," "This Year," or Custom Dates).
*   **Summary report showing:**
    *   Item Name.
    *   Total Quantity Purchased (Sum).
    *   Frequency (Count of times stock was added).
    *   Total Cost (Optional: Only if price input is added, otherwise skip).

### f) Export
*   Export reports as **CSV/Excel**.
*   File should be savable to local phone storage or shareable via WhatsApp/Email.

### g) Data Storage (New Section)
*   **Offline Database:** App must use local storage (SQLite/Room). No internet required.
*   **Backup/Restore:** Feature to export a database backup file and restore it (in case of phone switch).

## 3. Notes & Preferences
*   **Delivery:** Android APK file.
*   **Design:** Minimalist.
*   **Notifications:** Daily push notification at 9:00 PM (configurable) reminding user to fill the checklist.
