chrome.commands.onCommand.addListener((action) => {
  chrome.tabs.query({ currentWindow: true, highlighted: true }, (tabs) => {
    handleAction(action, tabs);
  });
});

/**
 * Calls the appropriate handler for a given action.
 *
 * @param {string} action The action to handle.
 * @param {Array} tabs The tabs to handle the action for.
 */
function handleAction(action, tabs) {
  switch (action) {
    case "toggle-pin":
      togglePins(tabs);
      break;
    case "move-to-new-window":
      handleMoveTabsToNewWindow(tabs);
      break;
  }
}

/**
 * If any of the tabs are unpinned, pin them. Otherwise, unpin them.
 */
function togglePins(tabs) {
  // If any tab is unpinned, pin all tabs
  const hasUnpinnedTabs = tabs.some((tab) => !tab.pinned);
  setTabsPinnedState(tabs, hasUnpinnedTabs);
}

/**
 * Sets all given tabs to the given pinned state.
 *
 * @param {Array} tabs The tabs to set the pinned state of.
 * @param {boolean} pinned The pinned state to set the tabs to.
 */
function setTabsPinnedState(tabs, pinned) {
  if (!pinned) {
    // Reverse the order so that the first tab is the last tab to be unpinned.
    // This keeps the tab order the same when unpinning.
    tabs.reverse();
  }
  tabs.forEach((tab) => chrome.tabs.update(tab.id, { pinned: pinned }));
}

/**
 * Moves all tabs to a new window. Retains pinned state and active tab.
 *
 * @param {Array} tabs
 */
function handleMoveTabsToNewWindow(tabs) {
  // Unpin all tabs, otherwise they can't be moved to a new window
  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const selectedTab = tabs.find((tab) => tab.active);

  setTabsPinnedState(pinnedTabs, false);
  chrome.windows.create({ tabId: tabs[0].id }, (newWindow) => {
    // The first tab is already moved
    const tabsToMove = tabs.slice(1);
    chrome.tabs.move(
      tabsToMove.map((window) => window.id),
      { windowId: newWindow.id, index: -1 },
      // Once the tabs are moved, pin the previously pinned tabs and activate
      // the previously active tab
      () => {
        setTabsPinnedState(pinnedTabs, true);
        chrome.tabs.update(selectedTab.id, { active: true });
      }
    );
  });
}
