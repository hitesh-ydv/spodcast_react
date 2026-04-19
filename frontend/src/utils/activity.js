const STORAGE_KEY = "userActivity";

// 🔹 Get all activity
export const getActivity = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

// 🔹 Save activity
export const saveActivity = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const recordActivity = (item) => {
    let activity = JSON.parse(localStorage.getItem("userActivity")) || [];

    const index = activity.findIndex((a) => a.id === item.id);

    if (index !== -1) {
        activity[index].lastPlayed = Date.now();
        activity[index].playCount += 1;
    } else {
        activity.push({
            ...item,
            lastPlayed: Date.now(),
            playCount: 1, // 👈 first time
        });
    }

    localStorage.setItem("userActivity", JSON.stringify(activity));

    // 🔥 trigger UI update
    window.dispatchEvent(new Event("activityUpdated"));
};

export const getTopActivity = () => {
    let activity = JSON.parse(localStorage.getItem("userActivity")) || [];

    // 🔥 step 1: qualified items
    const qualified = activity.filter(item => {
        if (item.type === "song") return item.playCount >= 5;
        if (["album", "playlist", "artist"].includes(item.type)) return item.playCount >= 4;
        return false;
    });

    // 🔥 liked item
    const liked = activity.find(item => item.type === "liked");

    // ❌ no qualified → nothing show
    if (qualified.length === 0) return [];

    // 🔥 sort by threshold reach (earlier first)
    qualified.sort((a, b) => a.lastPlayed - b.lastPlayed);

    let result = [];

    // 🔥 PAIR LOGIC (MAIN)
    if (liked) {
        // first pair always liked + first qualified
        result.push(liked, qualified[0]);

        // add remaining qualified
        for (let i = 1; i < qualified.length; i++) {
            result.push(qualified[i]);
            if (result.length === 8) break;
        }
    } else {
        result = qualified.slice(0, 8);
    }

    // ❌ less than 2 → hide
    if (result.length < 2) return [];

    // 🔥 enforce even count
    let count = result.length;

    if (count >= 8) count = 8;
    else if (count >= 6) count = 6;
    else if (count >= 4) count = 4;
    else count = 2;

    result = result.slice(0, count);

    return result;
};