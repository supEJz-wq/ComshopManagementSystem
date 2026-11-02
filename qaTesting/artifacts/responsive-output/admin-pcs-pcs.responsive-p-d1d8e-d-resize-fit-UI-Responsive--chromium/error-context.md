# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.responsive.spec.js >> phone-landscape 844x390 >> RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)
- Location: tests\admin\pcs\pcs.responsive.spec.js:95:9

# Error details

```
Error: Long names/list overflow; later resize steps are not verified.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 23

- Array []
+ Array [
+   Object {
+     "clipped": Array [
+       Object {
+         "contentWidth": 465,
+         "text": "RESP-PC-LONGNAMELONGNAMELONGNAMELONGNAMELONGNAMEXX",
+         "width": 233,
+       },
+     ],
+     "container": Object {
+       "left": 264,
+       "right": 534,
+       "width": 270,
+     },
+     "containerClientWidth": 265,
+     "containerContentWidth": 481,
+     "documentWidth": 844,
+     "innerWidth": 844,
+     "phase": "Long PC name",
+     "sidebarWidth": 240,
+     "viewport": 844,
+   },
+ ]
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
              - paragraph [ref=e73]: 25:00
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
                - paragraph [ref=e92]: 0:50
                - generic [ref=e93]: 1 min left
              - paragraph [ref=e94]:
                - generic [ref=e95]: 30:00
                - generic [ref=e96]: block
            - generic [ref=e97]:
              - paragraph [ref=e98]: Move to another PC
              - paragraph [ref=e99]: RESP-ISSUE-01 is out of action. Remaining time carries over and nothing is added to the bill.
              - generic [ref=e100]:
                - button "RESP-FREE-01" [ref=e101]
                - button "RESP-LIST-26" [ref=e107]
                - button "RESP-LIST-27" [ref=e113]
                - button "RESP-LIST-28" [ref=e119]
                - button "RESP-LIST-29" [ref=e125]
                - button "RESP-LIST-30" [ref=e131]
                - button "RESP-LIST-31" [ref=e137]
                - button "RESP-LIST-32" [ref=e143]
                - button "RESP-LIST-33" [ref=e149]
                - button "RESP-LIST-34" [ref=e155]
                - button "RESP-LIST-35" [ref=e161]
                - button "RESP-LIST-36" [ref=e167]
                - button "RESP-LIST-37" [ref=e173]
                - button "RESP-LIST-38" [ref=e179]
                - button "RESP-LIST-39" [ref=e185]
                - button "RESP-LIST-40" [ref=e191]
              - button "Cancel" [ref=e198]
          - generic [ref=e199]:
            - generic [ref=e200]: RESP-OFFLINE-01
            - generic [ref=e201]: Unresponsive
            - button "Repair" [ref=e208]
          - generic [ref=e209]:
            - generic [ref=e210]: RESP-PC-LONGNAMELONGNAMELONGNAMELONGNAMELONGNAMEXX
            - generic [ref=e211]: Rented
            - generic [ref=e217]:
              - generic [ref=e218]:
                - paragraph [ref=e219]: 10:00
                - generic [ref=e220]: 10 min left
              - paragraph [ref=e221]:
                - generic [ref=e222]: 30:00
                - generic [ref=e223]: block
            - generic [ref=e224]:
              - button "Stop rental" [ref=e225]
              - button "Extend" [ref=e226]
              - button "Mark issue" [ref=e227]
              - button "Mark unresponsive" [ref=e228]
          - generic [ref=e229]:
            - generic [ref=e230]: RESP-LIST-06
            - generic [ref=e231]: Rented
            - generic [ref=e237]:
              - paragraph [ref=e239]: 25:00
              - paragraph [ref=e240]:
                - generic [ref=e241]: 30:00
                - generic [ref=e242]: block
            - generic [ref=e243]:
              - button "Stop rental" [ref=e244]
              - button "Extend" [ref=e245]
              - button "Mark issue" [ref=e246]
              - button "Mark unresponsive" [ref=e247]
          - generic [ref=e248]:
            - generic [ref=e249]: RESP-LIST-07
            - generic [ref=e250]: Rented
            - generic [ref=e256]:
              - paragraph [ref=e258]: 25:00
              - paragraph [ref=e259]:
                - generic [ref=e260]: 30:00
                - generic [ref=e261]: block
            - generic [ref=e262]:
              - button "Stop rental" [ref=e263]
              - button "Extend" [ref=e264]
              - button "Mark issue" [ref=e265]
              - button "Mark unresponsive" [ref=e266]
          - generic [ref=e267]:
            - generic [ref=e268]: RESP-LIST-08
            - generic [ref=e269]: Rented
            - generic [ref=e275]:
              - paragraph [ref=e277]: 25:00
              - paragraph [ref=e278]:
                - generic [ref=e279]: 30:00
                - generic [ref=e280]: block
            - generic [ref=e281]:
              - button "Stop rental" [ref=e282]
              - button "Extend" [ref=e283]
              - button "Mark issue" [ref=e284]
              - button "Mark unresponsive" [ref=e285]
          - generic [ref=e286]:
            - generic [ref=e287]: RESP-LIST-09
            - generic [ref=e288]: Rented
            - generic [ref=e294]:
              - paragraph [ref=e296]: 25:00
              - paragraph [ref=e297]:
                - generic [ref=e298]: 30:00
                - generic [ref=e299]: block
            - generic [ref=e300]:
              - button "Stop rental" [ref=e301]
              - button "Extend" [ref=e302]
              - button "Mark issue" [ref=e303]
              - button "Mark unresponsive" [ref=e304]
          - generic [ref=e305]:
            - generic [ref=e306]: RESP-LIST-10
            - generic [ref=e307]: Rented
            - generic [ref=e313]:
              - paragraph [ref=e315]: 25:00
              - paragraph [ref=e316]:
                - generic [ref=e317]: 30:00
                - generic [ref=e318]: block
            - generic [ref=e319]:
              - button "Stop rental" [ref=e320]
              - button "Extend" [ref=e321]
              - button "Mark issue" [ref=e322]
              - button "Mark unresponsive" [ref=e323]
          - generic [ref=e324]:
            - generic [ref=e325]: RESP-LIST-11
            - generic [ref=e326]: Rented
            - generic [ref=e332]:
              - paragraph [ref=e334]: 25:00
              - paragraph [ref=e335]:
                - generic [ref=e336]: 30:00
                - generic [ref=e337]: block
            - generic [ref=e338]:
              - button "Stop rental" [ref=e339]
              - button "Extend" [ref=e340]
              - button "Mark issue" [ref=e341]
              - button "Mark unresponsive" [ref=e342]
          - generic [ref=e343]:
            - generic [ref=e344]: RESP-LIST-12
            - generic [ref=e345]: Rented
            - generic [ref=e351]:
              - paragraph [ref=e353]: 25:00
              - paragraph [ref=e354]:
                - generic [ref=e355]: 30:00
                - generic [ref=e356]: block
            - generic [ref=e357]:
              - button "Stop rental" [ref=e358]
              - button "Extend" [ref=e359]
              - button "Mark issue" [ref=e360]
              - button "Mark unresponsive" [ref=e361]
          - generic [ref=e362]:
            - generic [ref=e363]: RESP-LIST-13
            - generic [ref=e364]: Rented
            - generic [ref=e370]:
              - paragraph [ref=e372]: 25:00
              - paragraph [ref=e373]:
                - generic [ref=e374]: 30:00
                - generic [ref=e375]: block
            - generic [ref=e376]:
              - button "Stop rental" [ref=e377]
              - button "Extend" [ref=e378]
              - button "Mark issue" [ref=e379]
              - button "Mark unresponsive" [ref=e380]
          - generic [ref=e381]:
            - generic [ref=e382]: RESP-LIST-14
            - generic [ref=e383]: Rented
            - generic [ref=e389]:
              - paragraph [ref=e391]: 25:00
              - paragraph [ref=e392]:
                - generic [ref=e393]: 30:00
                - generic [ref=e394]: block
            - generic [ref=e395]:
              - button "Stop rental" [ref=e396]
              - button "Extend" [ref=e397]
              - button "Mark issue" [ref=e398]
              - button "Mark unresponsive" [ref=e399]
          - generic [ref=e400]:
            - generic [ref=e401]: RESP-LIST-15
            - generic [ref=e402]: Rented
            - generic [ref=e408]:
              - paragraph [ref=e410]: 25:00
              - paragraph [ref=e411]:
                - generic [ref=e412]: 30:00
                - generic [ref=e413]: block
            - generic [ref=e414]:
              - button "Stop rental" [ref=e415]
              - button "Extend" [ref=e416]
              - button "Mark issue" [ref=e417]
              - button "Mark unresponsive" [ref=e418]
          - generic [ref=e419]:
            - generic [ref=e420]: RESP-LIST-16
            - generic [ref=e421]: Rented
            - generic [ref=e427]:
              - paragraph [ref=e429]: 25:00
              - paragraph [ref=e430]:
                - generic [ref=e431]: 30:00
                - generic [ref=e432]: block
            - generic [ref=e433]:
              - button "Stop rental" [ref=e434]
              - button "Extend" [ref=e435]
              - button "Mark issue" [ref=e436]
              - button "Mark unresponsive" [ref=e437]
          - generic [ref=e438]:
            - generic [ref=e439]: RESP-LIST-17
            - generic [ref=e440]: Rented
            - generic [ref=e446]:
              - paragraph [ref=e448]: 25:00
              - paragraph [ref=e449]:
                - generic [ref=e450]: 30:00
                - generic [ref=e451]: block
            - generic [ref=e452]:
              - button "Stop rental" [ref=e453]
              - button "Extend" [ref=e454]
              - button "Mark issue" [ref=e455]
              - button "Mark unresponsive" [ref=e456]
          - generic [ref=e457]:
            - generic [ref=e458]: RESP-LIST-18
            - generic [ref=e459]: Rented
            - generic [ref=e465]:
              - paragraph [ref=e467]: 25:00
              - paragraph [ref=e468]:
                - generic [ref=e469]: 30:00
                - generic [ref=e470]: block
            - generic [ref=e471]:
              - button "Stop rental" [ref=e472]
              - button "Extend" [ref=e473]
              - button "Mark issue" [ref=e474]
              - button "Mark unresponsive" [ref=e475]
          - generic [ref=e476]:
            - generic [ref=e477]: RESP-LIST-19
            - generic [ref=e478]: Rented
            - generic [ref=e484]:
              - paragraph [ref=e486]: 25:00
              - paragraph [ref=e487]:
                - generic [ref=e488]: 30:00
                - generic [ref=e489]: block
            - generic [ref=e490]:
              - button "Stop rental" [ref=e491]
              - button "Extend" [ref=e492]
              - button "Mark issue" [ref=e493]
              - button "Mark unresponsive" [ref=e494]
          - generic [ref=e495]:
            - generic [ref=e496]: RESP-LIST-20
            - generic [ref=e497]: Rented
            - generic [ref=e503]:
              - paragraph [ref=e505]: 25:00
              - paragraph [ref=e506]:
                - generic [ref=e507]: 30:00
                - generic [ref=e508]: block
            - generic [ref=e509]:
              - button "Stop rental" [ref=e510]
              - button "Extend" [ref=e511]
              - button "Mark issue" [ref=e512]
              - button "Mark unresponsive" [ref=e513]
          - generic [ref=e514]:
            - generic [ref=e515]: RESP-LIST-21
            - generic [ref=e516]: Rented
            - generic [ref=e522]:
              - paragraph [ref=e524]: 25:00
              - paragraph [ref=e525]:
                - generic [ref=e526]: 30:00
                - generic [ref=e527]: block
            - generic [ref=e528]:
              - button "Stop rental" [ref=e529]
              - button "Extend" [ref=e530]
              - button "Mark issue" [ref=e531]
              - button "Mark unresponsive" [ref=e532]
          - generic [ref=e533]:
            - generic [ref=e534]: RESP-LIST-22
            - generic [ref=e535]: Rented
            - generic [ref=e541]:
              - paragraph [ref=e543]: 25:00
              - paragraph [ref=e544]:
                - generic [ref=e545]: 30:00
                - generic [ref=e546]: block
            - generic [ref=e547]:
              - button "Stop rental" [ref=e548]
              - button "Extend" [ref=e549]
              - button "Mark issue" [ref=e550]
              - button "Mark unresponsive" [ref=e551]
          - generic [ref=e552]:
            - generic [ref=e553]: RESP-LIST-23
            - generic [ref=e554]: Rented
            - generic [ref=e560]:
              - paragraph [ref=e562]: 25:00
              - paragraph [ref=e563]:
                - generic [ref=e564]: 30:00
                - generic [ref=e565]: block
            - generic [ref=e566]:
              - button "Stop rental" [ref=e567]
              - button "Extend" [ref=e568]
              - button "Mark issue" [ref=e569]
              - button "Mark unresponsive" [ref=e570]
          - generic [ref=e571]:
            - generic [ref=e572]: RESP-LIST-24
            - generic [ref=e573]: Rented
            - generic [ref=e579]:
              - paragraph [ref=e581]: 25:00
              - paragraph [ref=e582]:
                - generic [ref=e583]: 30:00
                - generic [ref=e584]: block
            - generic [ref=e585]:
              - button "Stop rental" [ref=e586]
              - button "Extend" [ref=e587]
              - button "Mark issue" [ref=e588]
              - button "Mark unresponsive" [ref=e589]
          - generic [ref=e590]:
            - generic [ref=e591]: RESP-LIST-25
            - generic [ref=e592]: Rented
            - generic [ref=e598]:
              - paragraph [ref=e600]: 25:00
              - paragraph [ref=e601]:
                - generic [ref=e602]: 30:00
                - generic [ref=e603]: block
            - generic [ref=e604]:
              - button "Stop rental" [ref=e605]
              - button "Extend" [ref=e606]
              - button "Mark issue" [ref=e607]
              - button "Mark unresponsive" [ref=e608]
          - generic [ref=e609]:
            - generic [ref=e610]: RESP-LIST-26
            - generic [ref=e611]: Free
            - generic [ref=e617]:
              - button "Start rental" [ref=e618]
              - button "Mark issue" [ref=e619]
              - button "Mark unresponsive" [ref=e620]
          - generic [ref=e621]:
            - generic [ref=e622]: RESP-LIST-27
            - generic [ref=e623]: Free
            - generic [ref=e629]:
              - button "Start rental" [ref=e630]
              - button "Mark issue" [ref=e631]
              - button "Mark unresponsive" [ref=e632]
          - generic [ref=e633]:
            - generic [ref=e634]: RESP-LIST-28
            - generic [ref=e635]: Free
            - generic [ref=e641]:
              - button "Start rental" [ref=e642]
              - button "Mark issue" [ref=e643]
              - button "Mark unresponsive" [ref=e644]
          - generic [ref=e645]:
            - generic [ref=e646]: RESP-LIST-29
            - generic [ref=e647]: Free
            - generic [ref=e653]:
              - button "Start rental" [ref=e654]
              - button "Mark issue" [ref=e655]
              - button "Mark unresponsive" [ref=e656]
          - generic [ref=e657]:
            - generic [ref=e658]: RESP-LIST-30
            - generic [ref=e659]: Free
            - generic [ref=e665]:
              - button "Start rental" [ref=e666]
              - button "Mark issue" [ref=e667]
              - button "Mark unresponsive" [ref=e668]
          - generic [ref=e669]:
            - generic [ref=e670]: RESP-LIST-31
            - generic [ref=e671]: Free
            - generic [ref=e677]:
              - button "Start rental" [ref=e678]
              - button "Mark issue" [ref=e679]
              - button "Mark unresponsive" [ref=e680]
          - generic [ref=e681]:
            - generic [ref=e682]: RESP-LIST-32
            - generic [ref=e683]: Free
            - generic [ref=e689]:
              - button "Start rental" [ref=e690]
              - button "Mark issue" [ref=e691]
              - button "Mark unresponsive" [ref=e692]
          - generic [ref=e693]:
            - generic [ref=e694]: RESP-LIST-33
            - generic [ref=e695]: Free
            - generic [ref=e701]:
              - button "Start rental" [ref=e702]
              - button "Mark issue" [ref=e703]
              - button "Mark unresponsive" [ref=e704]
          - generic [ref=e705]:
            - generic [ref=e706]: RESP-LIST-34
            - generic [ref=e707]: Free
            - generic [ref=e713]:
              - button "Start rental" [ref=e714]
              - button "Mark issue" [ref=e715]
              - button "Mark unresponsive" [ref=e716]
          - generic [ref=e717]:
            - generic [ref=e718]: RESP-LIST-35
            - generic [ref=e719]: Free
            - generic [ref=e725]:
              - button "Start rental" [ref=e726]
              - button "Mark issue" [ref=e727]
              - button "Mark unresponsive" [ref=e728]
          - generic [ref=e729]:
            - generic [ref=e730]: RESP-LIST-36
            - generic [ref=e731]: Free
            - generic [ref=e737]:
              - button "Start rental" [ref=e738]
              - button "Mark issue" [ref=e739]
              - button "Mark unresponsive" [ref=e740]
          - generic [ref=e741]:
            - generic [ref=e742]: RESP-LIST-37
            - generic [ref=e743]: Free
            - generic [ref=e749]:
              - button "Start rental" [ref=e750]
              - button "Mark issue" [ref=e751]
              - button "Mark unresponsive" [ref=e752]
          - generic [ref=e753]:
            - generic [ref=e754]: RESP-LIST-38
            - generic [ref=e755]: Free
            - generic [ref=e761]:
              - button "Start rental" [ref=e762]
              - button "Mark issue" [ref=e763]
              - button "Mark unresponsive" [ref=e764]
          - generic [ref=e765]:
            - generic [ref=e766]: RESP-LIST-39
            - generic [ref=e767]: Free
            - generic [ref=e773]:
              - button "Start rental" [ref=e774]
              - button "Mark issue" [ref=e775]
              - button "Mark unresponsive" [ref=e776]
          - generic [ref=e777]:
            - generic [ref=e778]: RESP-LIST-40
            - generic [ref=e779]: Free
            - generic [ref=e785]:
              - button "Start rental" [ref=e786]
              - button "Mark issue" [ref=e787]
              - button "Mark unresponsive" [ref=e788]
```

# Test source

```ts
  5   |  */
  6   | const {test, expect, screens} = require('../../../fixtures/responsive.fixture');
  7   | 
  8   | for (const screen of screens) {
  9   |     test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
  10  |         test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});
  11  | 
  12  |         /* TYPE: Happy path / Edge case. WHAT: Fit board and each editor.
  13  |          * TEST DATA: Free/rented/faulty PCs, duration inputs, and transfer targets.
  14  |          * EXPECTED: Controls fit and can be reached; opening/cancelling causes no writes. */
  15  |         test('RESP-PCS-01: board, registration, duration, and transfer controls fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
  16  |             await page.goto('/');
  17  |             await ui.home.waitForReady();
  18  |             await ui.layout.navigate('PCs');
  19  |             await ui.pcs.waitForReady();
  20  |             await ui.audit('PC board');
  21  |             // The longest valid booking can overflow its own tile even when
  22  |             // the outer page still fits. Measure the timer tile independently.
  23  |             await ui.audit('Long rental timer tile', ui.pcs.pcTile('RESP-ISSUE-01'));
  24  |             // A phone already overflowing cannot establish usable touch editors.
  25  |             // Keep this failed; leave later controls unverified at this size.
  26  |             if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC board overflows before form interaction; later controls are not verified.').toEqual([]);
  27  |             await ui.layout.activate(ui.pcs.addpc);
  28  |             await ui.pcs.fillPcName('RESP-DRAFT');
  29  |             await ui.audit('Add PC form', ui.pcs.addPcForm);
  30  |             await ui.control('Add PC input', ui.pcs.pcName);
  31  |             await ui.control('Add PC submit', ui.pcs.submitAddPc);
  32  |             await ui.layout.activate(ui.pcs.cancelAddPc);
  33  |             for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
  34  |                 const tile = ui.pcs.pcTile(name);
  35  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
  36  |                 await ui.pcs.fillDuration(name, mode, {hours: 1, minutes: 2, seconds: 3});
  37  |                 await ui.audit(`${mode} picker`, tile);
  38  |                 for (const part of ['hours', 'minutes', 'seconds']) await ui.control(`${mode} ${part}`, ui.pcs.durationField(name, mode, part));
  39  |                 await ui.control(`${mode} confirmation`, tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
  40  |                 await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
  41  |             }
  42  |             await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Transfer', exact: true}));
  43  |             await expect(ui.pcs.transferTargets).toHaveCount(1);
  44  |             await ui.audit('Transfer destinations', ui.pcs.pcTile('RESP-ISSUE-01'));
  45  |             await ui.control('Transfer destination', ui.pcs.transferTargets.first());
  46  |             await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
  47  |             expect(ui.writes).toEqual([]);
  48  |             expect(ui.failures, 'PC controls must fit and be usable without horizontal scrolling.').toEqual([]);
  49  |         });
  50  | 
  51  |         /* TYPE: Error path. WHAT: Fit data/validation errors and recovery controls.
  52  |          * TEST DATA: Failed inventory, zero duration, empty/duplicate PC names.
  53  |          * EXPECTED: Present errors fit. Missing registration feedback is annotated
  54  |          * as unverified message-layout coverage, separately from layout failures.
  55  |          * The real backend suite owns rejection and feedback PASS/FAIL results. */
  56  |         test('RESP-PCS-02: PC data and form errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
  57  |             ui.failRead('/api/pcs');
  58  |             await page.goto('/pcs');
  59  |             await expect(ui.layout.errorHeading).toBeVisible();
  60  |             await ui.audit('PC data error');
  61  |             if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC error screen overflows; phone form checks remain unverified.').toEqual([]);
  62  |             ui.failRead('');
  63  |             await page.reload();
  64  |             await ui.pcs.waitForReady();
  65  |             for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
  66  |                 const tile = ui.pcs.pcTile(name);
  67  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
  68  |                 await ui.pcs.fillDuration(name, mode, {hours: 0, minutes: 0, seconds: 0});
  69  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
  70  |                 await expect(tile.getByRole('alert')).toBeVisible();
  71  |                 await ui.audit(`${mode} invalid duration error`, tile);
  72  |                 await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
  73  |             }
  74  |             for (const name of ['', '   ', 'RESP-FREE-01']) {
  75  |                 await ui.pcs.openAddPc();
  76  |                 await ui.pcs.fillPcName(name);
  77  |                 const response = name.trim() ? page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/pcs') : null;
  78  |                 await ui.layout.activate(ui.pcs.submitAddPc);
  79  |                 if (response) expect((await response).status()).toBe(400);
  80  |                 // A missing message cannot be measured for responsive wrapping.
  81  |                 // This is already tracked by BUG-001/002/003 in the Excel report.
  82  |                 try { await ui.pcs.addPcError.waitFor({state: 'visible', timeout: 1000}); }
  83  |                 catch { ui.missing(`Registration feedback absent for ${name === '' ? 'empty' : name.trim() ? 'duplicate' : 'spaces-only'} name (existing BUG-001/002/003)`); }
  84  |                 await ui.audit('Registration validation form', ui.pcs.addPcForm);
  85  |                 await ui.pcs.cancelPcRegistration();
  86  |             }
  87  |             expect(ui.failures, 'The displayed errors and forms must fit the screen; absent-message layout is annotated separately.').toEqual([]);
  88  |         });
  89  | 
  90  |         /* TYPE: Edge case. WHAT: Fit long names/lists and preserve open editors.
  91  |          * TEST DATA: 40 PCs, a valid 50-character name, and many transfer targets.
  92  |          * EXPECTED: Names fit their tiles, vertical scrolling reaches the final
  93  |          * target/cancel, resizing preserves entered values, and no writes occur.
  94  |          * Native phone keyboard coverage remains manual, not simulated here. */
  95  |         test('RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
  96  |             ui.setData('long');
  97  |             await page.goto('/pcs');
  98  |             await ui.pcs.waitForReady();
  99  |             await ui.audit('Long PC name', ui.pcs.pcTile(ui.longName));
  100 |             await ui.pcs.openTransfer('RESP-ISSUE-01');
  101 |             expect(await ui.pcs.transferTargets.count()).toBeGreaterThan(10);
  102 |             await ui.audit('Long transfer destination list', ui.pcs.pcTile('RESP-ISSUE-01'));
  103 |             // Preserve the measured failure instead of forcing a touch outside
  104 |             // the device viewport and pretending the remaining resize steps ran.
> 105 |             if (ui.failures.length) expect(ui.failures, 'Long names/list overflow; later resize steps are not verified.').toEqual([]);
      |                                                                                                                           ^ Error: Long names/list overflow; later resize steps are not verified.
  106 |             await ui.control('Last transfer target', ui.pcs.transferTargets.last());
  107 |             await ui.control('Transfer cancel', ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
  108 |             await ui.pcs.cancelRentalPicker('RESP-ISSUE-01');
  109 |             await ui.pcs.openStartPicker('RESP-FREE-01');
  110 |             await ui.pcs.fillDuration('RESP-FREE-01', 'start', {minutes: 2});
  111 |             await page.setViewportSize({width: screen.height, height: screen.width});
  112 |             await expect(ui.pcs.durationField('RESP-FREE-01', 'start', 'minutes')).toHaveValue('2');
  113 |             await ui.audit('Open picker after resize', ui.pcs.pcTile('RESP-FREE-01'));
  114 |             expect(ui.writes).toEqual([]);
  115 |             expect(ui.failures, 'Long content must remain inside its tile and screen.').toEqual([]);
  116 |         });
  117 |     });
  118 | }
  119 | 
```