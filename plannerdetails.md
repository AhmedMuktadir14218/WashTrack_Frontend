Here is a comprehensive summary of the module's logical flow, business rules, and a detailed breakdown of how and where the APIs are used.

### 🏭 Module Description
This module is a **Wash Production Planner** for a garment/textile manufacturing system. It allows production managers to view existing production plans and create new plans by assigning pending Work Orders to specific manufacturing stages (like 1st Wash, Final Wash, 1st Dry, etc.), allocating machines, and calculating target quantities based on shift times and machine capacity.

---

### 🔄 Full Process Logic (Step-by-Step)

#### 1. Dashboard & Viewing Plans (`Plans.jsx`)
*   **Initialization**: When the user lands on the Plans page, the system fetches a list of available Plants and Units, and loads the first page of existing wash plans.
*   **Filtering**: The user can filter the table by Date range, Shift (Day/Night), Plant, Unit, or search for a specific Work Order (WO)/Style.
*   **Data Display**: Displays a comprehensive table showing WO details, Buyer, Wash Type, Process Stage, assigned Machines, Shift, and calculated targets (Base & Final).

#### 2. Creating a Plan - Step 1: Stage Selection (`CreatePlan.jsx`)
*   **Permissions**: The system checks the logged-in user's `processStageAccesses` to determine what they are allowed to do.
*   **Selection**: The user is presented with a grid of available "Process Stages" (e.g., Wash or Dry). Clicking a stage moves them to Step 2.
*   **Logic Fork**: The system defines logic based on the selection:
    *   **Wash Stage (IDs 4, 5)**: Requires machine allocation and strict target calculations.
    *   **Dry Stage (IDs 1, 3)**: Does *not* require machines. Target quantities are usually pulled from a previous Wash stage.

#### 3. Creating a Plan - Step 2: Configuration & Tabbed Interface
*   **Header Config**: The user selects the Plan Date, Shift (Day=11h, Night=12h), Plant, and Unit. Selecting Plant/Unit automatically fetches available machines for that location.
*   **Tab 1: Work Orders**: The user searches for pending Work Orders. Clicking a checkbox adds the WO to the plan.
    *   *Wash Logic*: User selects specific machines from a custom dropdown. The system automatically calculates the **Base Target** using the formula: `(((Shift Hours * 60) / Cycle Time) * Batch Qty) * Machine Count`. The user can input a percentage to auto-calculate the **Adjusted Target**.
*   **Tab 2: Planned (Dry Stages Only)**: If the user selected a Dry Stage, this tab appears. It fetches *already planned Wash items* so the user can easily pull them into the Dry stage without re-entering data. Base targets carry over.
*   **Tab 3: Selected (Review)**: Acts as a cart/checkout screen. Shows a summary of all selected Work Orders, total Base Targets, and total Final Targets.
*   **Validation & Submission**: The system checks for missing data. If it's a Wash stage, it ensures machines and targets are selected. It then structures the data array and submits it to the backend.

---

### 🔌 API Usage Details

Here is the exact mapping of every API endpoint defined in `plansApi.js` and how they are utilized in the application:

#### 1. `getPlantUnitList`
*   **Endpoint:** `GET /Dashboard/PlantUnitList`
*   **Where it's used:**
    *   `Plans.jsx` (inside `useEffect` / `fetchPlantUnitList`)
    *   `CreatePlan.jsx` (inside `useEffect` / `fetchPlantUnitList`)
*   **Purpose:** Fetches the hierarchical list of available Plants and their corresponding Units. Used to populate the "Plant" and "Unit" dropdown menus for filtering and configuration.

#### 2. `getWashPlans`
*   **Endpoint:** `GET /WashPlan/get-wash-plan`
*   **Where it's used:**
    *   `Plans.jsx` (inside `fetchPlans`): Fetches the main paginated list of existing plans for the dashboard, applying all user-selected filters.
    *   `CreatePlan.jsx` (inside `fetchWashPlans`): Specifically used when the **"Planned" tab** is active (Dry Stage). It fetches existing plans for the selected date/shift so the user can import previously washed garments into the drying process.

#### 3. `getMachines`
*   **Endpoint:** `GET /Dashboard/machines`
*   **Where it's used:**
    *   `CreatePlan.jsx` (inside `fetchMachines`)
*   **Purpose:** Triggered automatically when the user selects a Plant and Unit in Step 2. It fetches all physical machines available at that specific location. These machines populate the custom dropdown for machine allocation in Wash stages.

#### 4. `getWashPlanModal`
*   **Endpoint:** `GET /WashPlan/get-wash-plan-modal`
*   **Where it's used:**
    *   `CreatePlan.jsx` (inside `searchWorkOrders`)
*   **Purpose:** Operates the search bar in the **"Work Orders" tab**. It fetches a paginated list of *pending* work orders (garments waiting to be processed) based on search terms like WO Number, Style, Color, or Buyer.

#### 5. `createWashPlan`
*   **Endpoint:** `POST /WashPlan/CreateWashPlan`
*   **Where it's used:**
    *   `CreatePlan.jsx` (inside `handleSubmit`)
*   **Purpose:** The final submission endpoint. It takes an array of constructed plan objects (containing `workOrderId`, `processStageId`, `machineIds`, targets, shift, plant, unit, etc.) and saves them to the database. If successful, redirects the user back to the dashboard.