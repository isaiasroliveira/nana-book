import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("appearance supports keyboard focus, selection, persistence and reset", async () => {
  const profile = await mkdtemp(join(tmpdir(), "nana-browser-"));
  const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let socket;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Chrome did not start")), 15000);
      chrome.once("error", error => { clearTimeout(timeout); reject(error); });
      let output = "";
      chrome.stderr.on("data", chunk => {
        output += chunk;
        const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
    });
    socket = new WebSocket(endpoint);
    await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    });
    async function call(method, params = {}, sessionId) {
      const requestId = ++id;
      const response = new Promise(resolve => pending.set(requestId, resolve));
      socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
      const result = await response;
      assert.equal(result.error, undefined, JSON.stringify(result.error));
      return result.result;
    }
    const { targetId } = await call("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params) => call(method, params, sessionId);
    async function evaluate(expression) {
      const response = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      assert.equal(response.exceptionDetails, undefined, JSON.stringify(response.exceptionDetails));
      return response.result.value;
    }
    async function waitFor(expression) {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.fail(`Timed out: ${expression}`);
    }
    async function key(key, code, windowsVirtualKeyCode) {
      for (const type of ["keyDown", "keyUp"]) await page("Input.dispatchKeyEvent", { type, key, code, windowsVirtualKeyCode, ...(type === "keyDown" && key === "Enter" ? { text: "\r" } : {}) });
    }
    await page("Page.navigate", { url: process.env.TEST_BASE_URL || "http://localhost:3000" });
    await waitFor("!!document.querySelector('summary')");
    await new Promise(resolve => setTimeout(resolve, 500));
    for (const width of [390, 768, 1440]) {
      await page("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
      for (const palette of ["", "petrol", "sage", "rose"]) {
        for (const mode of ["light", "dark"]) {
          await evaluate(`Object.assign(document.documentElement.dataset, ${JSON.stringify({ palette, mode })})`);
          assert.equal(await evaluate("getComputedStyle(document.querySelector('.top')).backgroundColor"), "rgba(0, 0, 0, 0)", `${width}: ${palette || "original"} ${mode}`);
          assert.match(await evaluate("getComputedStyle(document.querySelector('.landing-art')).backgroundImage"), /nana-books-hero\.jpg/);
          for (const selector of [".hero .heading", ".brand", ".appearance-settings summary", ".nav .active"]) {
            assert.equal(await evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(selector)})).color`), "rgb(36, 59, 58)", `${palette} ${mode}: ${selector}`);
          }
        }
      }
    }
    await evaluate("delete document.documentElement.dataset.palette; delete document.documentElement.dataset.mode");
    await evaluate("document.querySelector('summary').focus()");
    await key("Enter", "Enter", 13);
    assert.equal(await evaluate("document.querySelector('details').open"), true);
    await key("Tab", "Tab", 9);
    assert.equal(await evaluate("document.activeElement.labels[0].textContent.trim().startsWith('Paleta')"), true);
    assert.notEqual(await evaluate("getComputedStyle(document.activeElement).outlineStyle"), "none");
    await evaluate(`(() => { const selects = document.querySelectorAll('select'); selects[0].value = 'petrol'; selects[0].dispatchEvent(new Event('change', {bubbles:true})); selects[1].value = 'dark'; selects[1].dispatchEvent(new Event('change', {bubbles:true})); })()`);
    await waitFor("document.documentElement.dataset.palette === 'petrol' && document.documentElement.dataset.mode === 'dark'");
    await page("Page.reload");
    await waitFor("document.documentElement.dataset.palette === 'petrol' && document.documentElement.dataset.mode === 'dark'");
    await evaluate("document.querySelector('details').open = true; document.querySelector('select').focus()");
    await evaluate(`(() => { const select = document.querySelector('select'); select.value = ''; select.dispatchEvent(new Event('change', {bubbles:true})); })()`);
    await waitFor("!document.documentElement.dataset.palette");
    assert.equal(await evaluate("localStorage.getItem('nana-appearance')"), null);
  } finally {
    socket?.close();
    chrome.kill();
    await new Promise(resolve => chrome.once("exit", resolve));
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
});
