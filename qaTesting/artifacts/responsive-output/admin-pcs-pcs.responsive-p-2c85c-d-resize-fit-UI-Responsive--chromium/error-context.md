# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.responsive.spec.js >> phone-small 360x800 >> RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)
- Location: tests\admin\pcs\pcs.responsive.spec.js:95:9

# Error details

```
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('main div.border-l-4').filter({ has: locator(':scope > span.font-semibold') }).filter({ has: locator(':scope > span').filter({ hasText: /^RESP-ISSUE-01$/ }) }).getByRole('button', { name: 'Transfer', exact: true })
    - locator resolved to <button type="button" class="rounded-control border border-state-issue px-2 py-1 text-xs font-medium text-state-issue hover:bg-surface-issue">Transfer</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button type="button" class="rounded-control bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700">Start rental</button> from <div class="flex flex-col rounded-card border border-slate-200 border-l-4 bg-white p-4 shadow-card border-l-state-free">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button type="button" class="rounded-control border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Stop rental</button> from <div class="flex flex-col rounded-card border border-slate-200 border-l-4 bg-white p-4 shadow-card border-l-state-busy">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">…</aside> intercepts pointer events
    - retrying click action
      - waiting 100ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">…</aside> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">…</aside> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">…</aside> intercepts pointer events
    - retrying click action
      - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <aside class="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">…</aside> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - paragraph [ref=e6]: CyberShopOS
      - paragraph [ref=e7]: Admin / Owner
    - navigation [ref=e8]:
      - link "Home" [ref=e9] [cursor=pointer]:
        - /url: /
      - link "PCs" [ref=e10] [cursor=pointer]:
        - /url: /pcs
      - link "Rentals" [ref=e11] [cursor=pointer]:
        - /url: /rentals
      - link "Payments" [ref=e12] [cursor=pointer]:
        - /url: /payments
      - link "Revenue" [ref=e13] [cursor=pointer]:
        - /url: /revenue
      - link "Analytics" [ref=e14] [cursor=pointer]:
        - /url: /analytics
      - link "Accounts" [ref=e15] [cursor=pointer]:
        - /url: /accounts
    - generic [ref=e16]:
      - paragraph [ref=e17]: responsive-admin
      - button "Sign out" [ref=e18]
  - generic [ref=e19]:
    - banner [ref=e20]:
      - paragraph [ref=e21]: Computer Shop Management System
      - generic [ref=e22]:
        - time [ref=e23]: 9:00 AM
        - generic [ref=e24]: Today
    - main [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - heading "PCs" [level=2] [ref=e29]
            - paragraph [ref=e30]: 40 computers. Names cannot be changed or removed once added.
          - button "Add PC" [ref=e32]
        - generic [ref=e33]:
          - generic [ref=e34]: Free
          - generic [ref=e38]: Rented
          - generic [ref=e42]: Issue
          - generic [ref=e46]: Unresponsive
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]: RESP-FREE-01
            - generic [ref=e53]: Free
            - generic [ref=e59]:
              - button "Start rental" [ref=e60]
              - button "Mark issue" [ref=e61]
              - button "Mark unresponsive" [ref=e62]
          - generic [ref=e63]:
            - generic [ref=e64]: RESP-RENTED-01
            - generic [ref=e65]: Rented
            - generic [ref=e71]:
              - paragraph [ref=e73]: 24:55
              - paragraph [ref=e74]:
                - generic [ref=e75]: 30:00
                - generic [ref=e76]: block
            - generic [ref=e77]:
              - button "Stop rental" [ref=e78]
              - button "Extend" [ref=e79]
              - button "Mark issue" [ref=e80]
              - button "Mark unresponsive" [ref=e81]
          - generic [ref=e82]:
            - generic [ref=e83]: RESP-ISSUE-01
            - generic [ref=e84]: Issue
            - generic [ref=e90]:
              - generic [ref=e91]:
                - paragraph [ref=e92]: 0:45
                - generic [ref=e93]: 1 min left
              - paragraph [ref=e94]:
                - generic [ref=e95]: 30:00
                - generic [ref=e96]: block
            - generic [ref=e97]:
              - button "Stop rental" [ref=e98]
              - button "Extend" [ref=e99]
              - button "Transfer" [ref=e100]
              - button "Resolve" [ref=e101]
              - button "Mark unresponsive" [ref=e102]
          - generic [ref=e103]:
            - generic [ref=e104]: RESP-OFFLINE-01
            - generic [ref=e105]: Unresponsive
            - button "Repair" [ref=e112]
          - generic [ref=e113]:
            - generic [ref=e114]: RESP-PC-LONGNAMELONGNAMELONGNAMELONGNAMELONGNAMEXX
            - generic [ref=e115]: Rented
            - generic [ref=e121]:
              - generic [ref=e122]:
                - paragraph [ref=e123]: 9:55
                - generic [ref=e124]: 10 min left
              - paragraph [ref=e125]:
                - generic [ref=e126]: 30:00
                - generic [ref=e127]: block
            - generic [ref=e128]:
              - button "Stop rental" [ref=e129]
              - button "Extend" [ref=e130]
              - button "Mark issue" [ref=e131]
              - button "Mark unresponsive" [ref=e132]
          - generic [ref=e133]:
            - generic [ref=e134]: RESP-LIST-06
            - generic [ref=e135]: Rented
            - generic [ref=e141]:
              - paragraph [ref=e143]: 24:55
              - paragraph [ref=e144]:
                - generic [ref=e145]: 30:00
                - generic [ref=e146]: block
            - generic [ref=e147]:
              - button "Stop rental" [ref=e148]
              - button "Extend" [ref=e149]
              - button "Mark issue" [ref=e150]
              - button "Mark unresponsive" [ref=e151]
          - generic [ref=e152]:
            - generic [ref=e153]: RESP-LIST-07
            - generic [ref=e154]: Rented
            - generic [ref=e160]:
              - paragraph [ref=e162]: 24:55
              - paragraph [ref=e163]:
                - generic [ref=e164]: 30:00
                - generic [ref=e165]: block
            - generic [ref=e166]:
              - button "Stop rental" [ref=e167]
              - button "Extend" [ref=e168]
              - button "Mark issue" [ref=e169]
              - button "Mark unresponsive" [ref=e170]
          - generic [ref=e171]:
            - generic [ref=e172]: RESP-LIST-08
            - generic [ref=e173]: Rented
            - generic [ref=e179]:
              - paragraph [ref=e181]: 24:55
              - paragraph [ref=e182]:
                - generic [ref=e183]: 30:00
                - generic [ref=e184]: block
            - generic [ref=e185]:
              - button "Stop rental" [ref=e186]
              - button "Extend" [ref=e187]
              - button "Mark issue" [ref=e188]
              - button "Mark unresponsive" [ref=e189]
          - generic [ref=e190]:
            - generic [ref=e191]: RESP-LIST-09
            - generic [ref=e192]: Rented
            - generic [ref=e198]:
              - paragraph [ref=e200]: 24:55
              - paragraph [ref=e201]:
                - generic [ref=e202]: 30:00
                - generic [ref=e203]: block
            - generic [ref=e204]:
              - button "Stop rental" [ref=e205]
              - button "Extend" [ref=e206]
              - button "Mark issue" [ref=e207]
              - button "Mark unresponsive" [ref=e208]
          - generic [ref=e209]:
            - generic [ref=e210]: RESP-LIST-10
            - generic [ref=e211]: Rented
            - generic [ref=e217]:
              - paragraph [ref=e219]: 24:55
              - paragraph [ref=e220]:
                - generic [ref=e221]: 30:00
                - generic [ref=e222]: block
            - generic [ref=e223]:
              - button "Stop rental" [ref=e224]
              - button "Extend" [ref=e225]
              - button "Mark issue" [ref=e226]
              - button "Mark unresponsive" [ref=e227]
          - generic [ref=e228]:
            - generic [ref=e229]: RESP-LIST-11
            - generic [ref=e230]: Rented
            - generic [ref=e236]:
              - paragraph [ref=e238]: 24:55
              - paragraph [ref=e239]:
                - generic [ref=e240]: 30:00
                - generic [ref=e241]: block
            - generic [ref=e242]:
              - button "Stop rental" [ref=e243]
              - button "Extend" [ref=e244]
              - button "Mark issue" [ref=e245]
              - button "Mark unresponsive" [ref=e246]
          - generic [ref=e247]:
            - generic [ref=e248]: RESP-LIST-12
            - generic [ref=e249]: Rented
            - generic [ref=e255]:
              - paragraph [ref=e257]: 24:55
              - paragraph [ref=e258]:
                - generic [ref=e259]: 30:00
                - generic [ref=e260]: block
            - generic [ref=e261]:
              - button "Stop rental" [ref=e262]
              - button "Extend" [ref=e263]
              - button "Mark issue" [ref=e264]
              - button "Mark unresponsive" [ref=e265]
          - generic [ref=e266]:
            - generic [ref=e267]: RESP-LIST-13
            - generic [ref=e268]: Rented
            - generic [ref=e274]:
              - paragraph [ref=e276]: 24:55
              - paragraph [ref=e277]:
                - generic [ref=e278]: 30:00
                - generic [ref=e279]: block
            - generic [ref=e280]:
              - button "Stop rental" [ref=e281]
              - button "Extend" [ref=e282]
              - button "Mark issue" [ref=e283]
              - button "Mark unresponsive" [ref=e284]
          - generic [ref=e285]:
            - generic [ref=e286]: RESP-LIST-14
            - generic [ref=e287]: Rented
            - generic [ref=e293]:
              - paragraph [ref=e295]: 24:55
              - paragraph [ref=e296]:
                - generic [ref=e297]: 30:00
                - generic [ref=e298]: block
            - generic [ref=e299]:
              - button "Stop rental" [ref=e300]
              - button "Extend" [ref=e301]
              - button "Mark issue" [ref=e302]
              - button "Mark unresponsive" [ref=e303]
          - generic [ref=e304]:
            - generic [ref=e305]: RESP-LIST-15
            - generic [ref=e306]: Rented
            - generic [ref=e312]:
              - paragraph [ref=e314]: 24:55
              - paragraph [ref=e315]:
                - generic [ref=e316]: 30:00
                - generic [ref=e317]: block
            - generic [ref=e318]:
              - button "Stop rental" [ref=e319]
              - button "Extend" [ref=e320]
              - button "Mark issue" [ref=e321]
              - button "Mark unresponsive" [ref=e322]
          - generic [ref=e323]:
            - generic [ref=e324]: RESP-LIST-16
            - generic [ref=e325]: Rented
            - generic [ref=e331]:
              - paragraph [ref=e333]: 24:55
              - paragraph [ref=e334]:
                - generic [ref=e335]: 30:00
                - generic [ref=e336]: block
            - generic [ref=e337]:
              - button "Stop rental" [ref=e338]
              - button "Extend" [ref=e339]
              - button "Mark issue" [ref=e340]
              - button "Mark unresponsive" [ref=e341]
          - generic [ref=e342]:
            - generic [ref=e343]: RESP-LIST-17
            - generic [ref=e344]: Rented
            - generic [ref=e350]:
              - paragraph [ref=e352]: 24:55
              - paragraph [ref=e353]:
                - generic [ref=e354]: 30:00
                - generic [ref=e355]: block
            - generic [ref=e356]:
              - button "Stop rental" [ref=e357]
              - button "Extend" [ref=e358]
              - button "Mark issue" [ref=e359]
              - button "Mark unresponsive" [ref=e360]
          - generic [ref=e361]:
            - generic [ref=e362]: RESP-LIST-18
            - generic [ref=e363]: Rented
            - generic [ref=e369]:
              - paragraph [ref=e371]: 24:55
              - paragraph [ref=e372]:
                - generic [ref=e373]: 30:00
                - generic [ref=e374]: block
            - generic [ref=e375]:
              - button "Stop rental" [ref=e376]
              - button "Extend" [ref=e377]
              - button "Mark issue" [ref=e378]
              - button "Mark unresponsive" [ref=e379]
          - generic [ref=e380]:
            - generic [ref=e381]: RESP-LIST-19
            - generic [ref=e382]: Rented
            - generic [ref=e388]:
              - paragraph [ref=e390]: 24:55
              - paragraph [ref=e391]:
                - generic [ref=e392]: 30:00
                - generic [ref=e393]: block
            - generic [ref=e394]:
              - button "Stop rental" [ref=e395]
              - button "Extend" [ref=e396]
              - button "Mark issue" [ref=e397]
              - button "Mark unresponsive" [ref=e398]
          - generic [ref=e399]:
            - generic [ref=e400]: RESP-LIST-20
            - generic [ref=e401]: Rented
            - generic [ref=e407]:
              - paragraph [ref=e409]: 24:55
              - paragraph [ref=e410]:
                - generic [ref=e411]: 30:00
                - generic [ref=e412]: block
            - generic [ref=e413]:
              - button "Stop rental" [ref=e414]
              - button "Extend" [ref=e415]
              - button "Mark issue" [ref=e416]
              - button "Mark unresponsive" [ref=e417]
          - generic [ref=e418]:
            - generic [ref=e419]: RESP-LIST-21
            - generic [ref=e420]: Rented
            - generic [ref=e426]:
              - paragraph [ref=e428]: 24:55
              - paragraph [ref=e429]:
                - generic [ref=e430]: 30:00
                - generic [ref=e431]: block
            - generic [ref=e432]:
              - button "Stop rental" [ref=e433]
              - button "Extend" [ref=e434]
              - button "Mark issue" [ref=e435]
              - button "Mark unresponsive" [ref=e436]
          - generic [ref=e437]:
            - generic [ref=e438]: RESP-LIST-22
            - generic [ref=e439]: Rented
            - generic [ref=e445]:
              - paragraph [ref=e447]: 24:55
              - paragraph [ref=e448]:
                - generic [ref=e449]: 30:00
                - generic [ref=e450]: block
            - generic [ref=e451]:
              - button "Stop rental" [ref=e452]
              - button "Extend" [ref=e453]
              - button "Mark issue" [ref=e454]
              - button "Mark unresponsive" [ref=e455]
          - generic [ref=e456]:
            - generic [ref=e457]: RESP-LIST-23
            - generic [ref=e458]: Rented
            - generic [ref=e464]:
              - paragraph [ref=e466]: 24:55
              - paragraph [ref=e467]:
                - generic [ref=e468]: 30:00
                - generic [ref=e469]: block
            - generic [ref=e470]:
              - button "Stop rental" [ref=e471]
              - button "Extend" [ref=e472]
              - button "Mark issue" [ref=e473]
              - button "Mark unresponsive" [ref=e474]
          - generic [ref=e475]:
            - generic [ref=e476]: RESP-LIST-24
            - generic [ref=e477]: Rented
            - generic [ref=e483]:
              - paragraph [ref=e485]: 24:55
              - paragraph [ref=e486]:
                - generic [ref=e487]: 30:00
                - generic [ref=e488]: block
            - generic [ref=e489]:
              - button "Stop rental" [ref=e490]
              - button "Extend" [ref=e491]
              - button "Mark issue" [ref=e492]
              - button "Mark unresponsive" [ref=e493]
          - generic [ref=e494]:
            - generic [ref=e495]: RESP-LIST-25
            - generic [ref=e496]: Rented
            - generic [ref=e502]:
              - paragraph [ref=e504]: 24:55
              - paragraph [ref=e505]:
                - generic [ref=e506]: 30:00
                - generic [ref=e507]: block
            - generic [ref=e508]:
              - button "Stop rental" [ref=e509]
              - button "Extend" [ref=e510]
              - button "Mark issue" [ref=e511]
              - button "Mark unresponsive" [ref=e512]
          - generic [ref=e513]:
            - generic [ref=e514]: RESP-LIST-26
            - generic [ref=e515]: Free
            - generic [ref=e521]:
              - button "Start rental" [ref=e522]
              - button "Mark issue" [ref=e523]
              - button "Mark unresponsive" [ref=e524]
          - generic [ref=e525]:
            - generic [ref=e526]: RESP-LIST-27
            - generic [ref=e527]: Free
            - generic [ref=e533]:
              - button "Start rental" [ref=e534]
              - button "Mark issue" [ref=e535]
              - button "Mark unresponsive" [ref=e536]
          - generic [ref=e537]:
            - generic [ref=e538]: RESP-LIST-28
            - generic [ref=e539]: Free
            - generic [ref=e545]:
              - button "Start rental" [ref=e546]
              - button "Mark issue" [ref=e547]
              - button "Mark unresponsive" [ref=e548]
          - generic [ref=e549]:
            - generic [ref=e550]: RESP-LIST-29
            - generic [ref=e551]: Free
            - generic [ref=e557]:
              - button "Start rental" [ref=e558]
              - button "Mark issue" [ref=e559]
              - button "Mark unresponsive" [ref=e560]
          - generic [ref=e561]:
            - generic [ref=e562]: RESP-LIST-30
            - generic [ref=e563]: Free
            - generic [ref=e569]:
              - button "Start rental" [ref=e570]
              - button "Mark issue" [ref=e571]
              - button "Mark unresponsive" [ref=e572]
          - generic [ref=e573]:
            - generic [ref=e574]: RESP-LIST-31
            - generic [ref=e575]: Free
            - generic [ref=e581]:
              - button "Start rental" [ref=e582]
              - button "Mark issue" [ref=e583]
              - button "Mark unresponsive" [ref=e584]
          - generic [ref=e585]:
            - generic [ref=e586]: RESP-LIST-32
            - generic [ref=e587]: Free
            - generic [ref=e593]:
              - button "Start rental" [ref=e594]
              - button "Mark issue" [ref=e595]
              - button "Mark unresponsive" [ref=e596]
          - generic [ref=e597]:
            - generic [ref=e598]: RESP-LIST-33
            - generic [ref=e599]: Free
            - generic [ref=e605]:
              - button "Start rental" [ref=e606]
              - button "Mark issue" [ref=e607]
              - button "Mark unresponsive" [ref=e608]
          - generic [ref=e609]:
            - generic [ref=e610]: RESP-LIST-34
            - generic [ref=e611]: Free
            - generic [ref=e617]:
              - button "Start rental" [ref=e618]
              - button "Mark issue" [ref=e619]
              - button "Mark unresponsive" [ref=e620]
          - generic [ref=e621]:
            - generic [ref=e622]: RESP-LIST-35
            - generic [ref=e623]: Free
            - generic [ref=e629]:
              - button "Start rental" [ref=e630]
              - button "Mark issue" [ref=e631]
              - button "Mark unresponsive" [ref=e632]
          - generic [ref=e633]:
            - generic [ref=e634]: RESP-LIST-36
            - generic [ref=e635]: Free
            - generic [ref=e641]:
              - button "Start rental" [ref=e642]
              - button "Mark issue" [ref=e643]
              - button "Mark unresponsive" [ref=e644]
          - generic [ref=e645]:
            - generic [ref=e646]: RESP-LIST-37
            - generic [ref=e647]: Free
            - generic [ref=e653]:
              - button "Start rental" [ref=e654]
              - button "Mark issue" [ref=e655]
              - button "Mark unresponsive" [ref=e656]
          - generic [ref=e657]:
            - generic [ref=e658]: RESP-LIST-38
            - generic [ref=e659]: Free
            - generic [ref=e665]:
              - button "Start rental" [ref=e666]
              - button "Mark issue" [ref=e667]
              - button "Mark unresponsive" [ref=e668]
          - generic [ref=e669]:
            - generic [ref=e670]: RESP-LIST-39
            - generic [ref=e671]: Free
            - generic [ref=e677]:
              - button "Start rental" [ref=e678]
              - button "Mark issue" [ref=e679]
              - button "Mark unresponsive" [ref=e680]
          - generic [ref=e681]:
            - generic [ref=e682]: RESP-LIST-40
            - generic [ref=e683]: Free
            - generic [ref=e689]:
              - button "Start rental" [ref=e690]
              - button "Mark issue" [ref=e691]
              - button "Mark unresponsive" [ref=e692]
```

# Test source

```ts
  168 | 
  169 |     /** Mark only the exact named PC Unresponsive. @returns {Promise<void>} */
  170 |     async markUnresponsive(pcName) {
  171 |         const tile = this.pcTile(pcName);
  172 |         await this._clickForApi(tile.getByRole('button', {name: 'Mark unresponsive', exact: true}),
  173 |             'PATCH', /^\/api\/pcs\/\d+\/status$/);
  174 |         await tile.getByText('Unresponsive', {exact: true}).waitFor({state: 'visible'});
  175 |     }
  176 | 
  177 |     /**
  178 |      * Use the named PC's Repair or Resolve action and wait for its returned status.
  179 |      * The spec independently checks whether an active rental was preserved correctly.
  180 |      * @returns {Promise<object>}
  181 |      */
  182 |     async repairPc(pcName) {
  183 |         const tile = this.pcTile(pcName);
  184 |         const data = await this._clickForApi(tile.getByRole('button', {name: /^(Repair|Resolve)$/}),
  185 |             'POST', /^\/api\/pcs\/repair$/);
  186 |         const label = {free: 'Free', rented: 'Rented', issue: 'Issue', unresponsive: 'Unresponsive'}[data.pc.status];
  187 |         await tile.getByText(label, {exact: true}).waitFor({state: 'visible'});
  188 |         return data;
  189 |     }
  190 | 
  191 |     // DURATION PICKERS — fields repeat between tiles, so always scope by exact PC name.
  192 | 
  193 |     /** Open the start picker on an idle Free PC. @returns {Promise<void>} */
  194 |     async openStartPicker(pcName) {
  195 |         await this.pcTile(pcName).getByRole('button', {name: 'Start rental', exact: true}).click();
  196 |     }
  197 | 
  198 |     /** Open the extension picker on an active rental. @returns {Promise<void>} */
  199 |     async openExtendPicker(pcName) {
  200 |         await this.pcTile(pcName).getByRole('button', {name: 'Extend', exact: true}).click();
  201 |     }
  202 | 
  203 |     /** Locate a start/extend number field inside one tile. @returns {import('@playwright/test').Locator} */
  204 |     durationField(pcName, mode, part) {
  205 |         return this.pcTile(pcName).locator(`[id="custom-${mode}-${part}"]`);
  206 |     }
  207 | 
  208 |     /** Fill hours/minutes/seconds; blank or invalid numbers are allowed for validation tests. @returns {Promise<void>} */
  209 |     async fillDuration(pcName, mode, duration) {
  210 |         for (const part of ['hours', 'minutes', 'seconds']) {
  211 |             await this.durationField(pcName, mode, part).fill(String(duration[part] ?? ''));
  212 |         }
  213 |     }
  214 | 
  215 |     /** Cancel the current start/extend/transfer picker without changing the rental. @returns {Promise<void>} */
  216 |     async cancelRentalPicker(pcName) {
  217 |         await this.pcTile(pcName).getByRole('button', {name: 'Cancel', exact: true}).click();
  218 |         await this.pcTile(pcName).locator('div.rounded-panel').waitFor({state: 'hidden'});
  219 |     }
  220 | 
  221 |     // RENTAL ACTIONS — use the real API; the calling spec checks the resulting counts.
  222 | 
  223 |     /**
  224 |      * Start one rental on an idle Free PC using a visible preset such as 30 min.
  225 |      * Wait for the rental controls to appear; return the API data for independent checks.
  226 |      * @returns {Promise<object>} Successful start response, including the rental ID.
  227 |      */
  228 |     async startRentalPreset(pcName, label) {
  229 |         const tile = this.pcTile(pcName);
  230 |         await tile.getByRole('button', {name: 'Start rental', exact: true}).click();
  231 |         const data = await this._clickForApi(tile.getByRole('button', {name: label, exact: true}),
  232 |             'POST', /^\/api\/rentals\/start$/);
  233 |         await tile.getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'visible'});
  234 |         return data;
  235 |     }
  236 | 
  237 |     /** Start a valid custom duration on the named Free PC. @returns {Promise<object>} */
  238 |     async startRentalCustom(pcName, duration) {
  239 |         await this.openStartPicker(pcName);
  240 |         await this.fillDuration(pcName, 'start', duration);
  241 |         const data = await this._clickForApi(
  242 |             this.pcTile(pcName).getByRole('button', {name: 'Start', exact: true}),
  243 |             'POST', /^\/api\/rentals\/start$/);
  244 |         await this.pcTile(pcName).getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'visible'});
  245 |         return data;
  246 |     }
  247 | 
  248 |     /** Add a visible preset to an active rental. The label excludes the + prefix. @returns {Promise<object>} */
  249 |     async extendRentalPreset(pcName, label) {
  250 |         await this.openExtendPicker(pcName);
  251 |         return this._clickForApi(this.pcTile(pcName).getByRole('button', {name: `+${label}`, exact: true}),
  252 |             'POST', /^\/api\/rentals\/extend$/);
  253 |     }
  254 | 
  255 |     /** Add a valid custom duration to an active rental. @returns {Promise<object>} */
  256 |     async extendRentalCustom(pcName, duration) {
  257 |         await this.openExtendPicker(pcName);
  258 |         await this.fillDuration(pcName, 'extend', duration);
  259 |         return this._clickForApi(this.pcTile(pcName).getByRole('button', {name: 'Add', exact: true}),
  260 |             'POST', /^\/api\/rentals\/extend$/);
  261 |     }
  262 | 
  263 |     // TRANSFER PICKER — the destination name belongs to a button inside the source tile.
  264 | 
  265 |     /** Open Transfer and wait for the eligible-target lookup to finish. @returns {Promise<void>} */
  266 |     async openTransfer(pcName) {
  267 |         const tile = this.pcTile(pcName);
> 268 |         await tile.getByRole('button', {name: 'Transfer', exact: true}).click();
      |                                                                         ^ TimeoutError: locator.click: Timeout 5000ms exceeded.
  269 |         await tile.getByText('Move to another PC', {exact: true}).waitFor({state: 'visible'});
  270 |         await tile.getByText('Checking which PCs are free...', {exact: true}).waitFor({state: 'hidden'});
  271 |     }
  272 | 
  273 |     /** Read eligible destination PC names from the open source picker. @returns {Promise<string[]>} */
  274 |     async readTransferTargets(pcName) {
  275 |         return (await this.pcTile(pcName).locator('div.rounded-panel')
  276 |             .getByRole('button').filter({hasNotText: /^Cancel$/}).allTextContents()).map((name) => name.trim());
  277 |     }
  278 | 
  279 |     /** Move a rental to a named target; wait until its source no longer has Stop rental. @returns {Promise<object>} */
  280 |     async transferRental(fromPcName, toPcName) {
  281 |         await this.openTransfer(fromPcName);
  282 |         const data = await this._clickForApi(
  283 |             this.pcTile(fromPcName).locator('div.rounded-panel').getByRole('button', {name: toPcName, exact: true}),
  284 |             'POST', /^\/api\/rentals\/transfer$/);
  285 |         await this.pcTile(fromPcName).getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'hidden'});
  286 |         return data;
  287 |     }
  288 | 
  289 |     /**
  290 |      * Stop this PC's active rental, creating an unsettled bill and opening Payments.
  291 |      * This does not settle or delete the bill. Use an isolated database for this action.
  292 |      * @returns {Promise<object>} Successful stop response, including the new bill.
  293 |      */
  294 |     async stopRental(pcName) {
  295 |         const data = await this._clickForApi(
  296 |             this.pcTile(pcName).getByRole('button', {name: 'Stop rental', exact: true}),
  297 |             'POST', /^\/api\/rentals\/stop$/);
  298 |         await this.page.waitForURL(/\/payments$/);
  299 |         return data;
  300 |     }
  301 | 
  302 |     /**
  303 |      * Internal action helper: watch the matching API request before clicking.
  304 |      * Reject failed responses instead of allowing a failed action to look successful.
  305 |      * @returns {Promise<object>} Parsed successful API response.
  306 |      */
  307 |     async _clickForApi(button, method, pathname) {
  308 |         const pending = this.page.waitForResponse((response) =>
  309 |             response.request().method() === method && pathname.test(new URL(response.url()).pathname));
  310 |         await button.click();
  311 |         const response = await pending;
  312 |         const data = await response.json();
  313 |         if (!response.ok() || data.ok !== true) {
  314 |             throw new Error(data.error || `PC action failed: HTTP ${response.status()}`);
  315 |         }
  316 |         return data;
  317 |     }
  318 | 
  319 | }
  320 | 
  321 | 
  322 | module.exports = { pcsPageAdmin };
  323 | 
```