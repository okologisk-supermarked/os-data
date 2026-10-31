# Bygger handelsbetingelser for ØS og HE (tekster/handelsbetingelser_os.html og _he.html)
import os, re
D = os.path.dirname(os.path.abspath(__file__))

SHOPS = {
 'os': dict(navn='Økologisk-Supermarked.dk', mail='info@okologisk-supermarked.dk', g='#2e7d32', lg='#f1f8f1', bd='#d3e8d4', knap='#f7941d',
   kontakt='Ejbyvej 82B, 4623 Lille Skensved<br>E-mail: info@okologisk-supermarked.dk',
   gebyr='<p>Betaling med betalingskort er gebyrfri.</p>',
   fragt=[('GLS Pakkeshop', 'Gratis ved køb over 699 kr.', '48,75 kr.'), ('GLS Erhvervslevering', 'Levering på hverdage i åbningstiden. Husk at udfylde firmanavn.', '58,75 kr.'), ('GLS Hjemmelevering', '', '68,75 kr.')],
   fjern='2-4', fjernsend='4', infoside='Information', retur_glas=''),
 'he': dict(navn='Helsekost-Ekspres.dk', mail='info@helsekost-ekspres.dk', g='#1e5b3a', lg='#f2f7f4', bd='#d5e5da', knap='#1e5b3a',
   kontakt='Ejbyvej 82B, 4623 Lille Skensved<br>Tlf.: 42 47 93 90 (mandag-fredag kl. 10-14)<br>E-mail: info@helsekost-ekspres.dk (vi besvarer e-mails inden for 1 hverdag)',
   gebyr='<p>Betaling med betalingskort udstedt til private i EU/EØS er gebyrfri. Der opkræves gebyr på erhvervskort (firmakort). Gebyret oplyses i betalingsvinduet, før betalingen gennemføres, og kan ses på ordren efterfølgende.</p>',
   fragt=[('GLS Pakkeshop', '', '58,75 kr.'), ('GLS Erhvervslevering', 'Levering på hverdage i åbningstiden. Husk at udfylde firmanavn.', '68,75 kr.'), ('GLS Hjemmelevering', '', '78,75 kr.')],
   fjern='1-3', fjernsend='3', infoside='Kundeservice', retur_glas=' Udgifterne til returnering af disse varer forventes højst at koste 80 kr.'),
}

def side(k):
    s = SHOPS[k]; N = s['navn']; M = s['mail']
    fragt = ''.join(f'<tr><td>{a}' + (f'<br><span class="hb-lille">{b}</span>' if b else '') + f'</td><td class="hb-pris">{c}</td></tr>' for a, b, c in s['fragt'])
    sek = []
    def add(titel, html): sek.append((titel, html))
    add('Generelt', f'''<p>Her finder du svar på de mest almindelige spørgsmål om, hvordan du handler hos {N}.</p>
<p>Nedenstående salgs- og leveringsbetingelser gælder for alle leverancer fra {N}, CVR-nr. 32787339. Juridisk navn: Benjo ApS.</p>
<p>{s['kontakt']}</p>
<p>Ved din bestilling af varer hos {N} accepterer du nedenstående aftalevilkår. Der refereres til dansk rets almindelige købe- og aftaleretlige regler, herunder reglerne om forbrugerkøb.</p>''')
    add('Priser og særlige tilbud', f'''<p>Alle priser er i danske kroner inklusiv moms.</p>
<p>Visse tilbud hos {N} er rettet mod privatkunder. {N} forbeholder sig derfor ret til at begrænse antallet af købte enheder pr. kunde.</p>
<p>For miljøets skyld sender vi ikke papirfakturaer. Du modtager en ordrebekræftelse på mail, som udgør fakturaen.</p>
<p>Laver du mere end én ordre, fletter vi dem sammen til én ordre. Varer, der er begrænset til maks. 1 stk. pr. ordre, kan derfor ikke købes flere gange ved at lave flere ordrer.</p>
<p>Der tages forbehold for tastefejl i varetitler og varebeskrivelser samt for produktbilleder, der kan afvige fra den tilsendte vare. Du er velkommen til at kontakte os, hvis der er afvigelser mellem tekst og billede.</p>''')
    add('Lagerstatus, udsolgte og udgåede varer', f'''<p>Når du handler hos {N}, afstemmes lagerbeholdningen to gange: når varen lægges i kurven, og når du betaler. Vi bestræber os på altid at vise den korrekte lagerstatus, men der kan i enkelte tilfælde være forskel på den viste og den faktiske lagerbeholdning.</p>
<p>Da vi ikke selv producerer de varer, vi sælger, kan vi ikke garantere, at en vare er på lager hos leverandøren. Vores system opdaterer automatisk lagerstatus fra leverandørerne, men der kan forekomme fejl. Vi tager derfor forbehold for udsolgte og udgåede varer.</p>
<p>Er en vare på din ordre udsolgt eller udgået, gør vi som udgangspunkt følgende:</p>
<ul><li>fjerner varen fra ordren og retter den til 0 kr. på ordrebekræftelsen/fakturaen</li><li>hæver kun betaling for de varer, der afsendes</li><li>sender dig en mail om, hvilken vare der er rettet, og hvilket beløb der er hævet</li></ul>
<p>Er der varer på din ordre, som er særligt vigtige for dig, kan du skrive til os, så kontakter vi dig, inden ordren afsendes.</p>
<p>Vi laver ikke restordrer eller delleveringer, da vores erfaring er, at kunderne foretrækker hurtig levering frem for at vente 1-2 dage ekstra på svar frem og tilbage.</p>''')
    add('Betaling', f'''<p>Der kan betales med MobilePay, Apple Pay, Google Pay, Dankort, VISA/Dankort, VISA, Eurocard/MasterCard og Visa Electron.</p>
{s['gebyr']}
<p>Beløbet hæves først på dit kort, når varen afsendes.</p>
<p><strong>Sikkerhed ved betaling</strong><br>Dine kortoplysninger og købsbeløbet overføres krypteret via vores godkendte betalingsudbyder. {N} gemmer ikke dine kortoplysninger, og vi kan aldrig trække mere end det beløb, du har godkendt ved din bestilling. Du kan få pengene tilbage, hvis varen ikke leveres, eller hvis du benytter din fortrydelsesret.</p>''')
    add('Levering og leveringstid', f'''<p>Vi sender med GLS til pakkeshop, til din hjemmeadresse eller til din arbejdsplads. Vi leverer til hele Danmark, men kun til adresser i Danmark.</p>
<table>{fragt}</table>
<p>Når varerne sendes fra vores lager, modtager du en e-mail med et trackingnummer.</p>
<p>Leveringstiden afhænger af, om varerne er på lager, og beregnes altid efter den vare, der har længst leveringstid. Er alle varer på lager, forventer vi at afsende ordren inden for 1 hverdag. Bestiller du varer med {s['fjern']} hverdages leveringstid fra fjernlager, forventer vi at afsende ordren inden for {s['fjernsend']} hverdage.</p>''')
    add('Fortrydelsesret', f'''<p>Ifølge forbrugeraftaleloven har du som forbruger 14 dages fortrydelsesret fra den dag, du modtager varen. Fristen betyder, at du har 14 dage fra modtagelsen til at give os besked om, at du vil fortryde dit køb, og derefter yderligere 14 dage til at sende varen retur.</p>
<p>Du giver os besked ved at bruge vores digitale formular, ved at skrive til {M} eller ved at bruge standardfortrydelsesformularen nederst på siden.</p>
<p><a class="hb-knap" href="#os-fortryd">Fortryd dit køb</a></p>
<p>Du kan ikke fortryde købet ved at nægte at modtage pakken eller ved ikke at hente den i pakkeshoppen. Gør du det, opkræver vi et beløb, der svarer til vores udgifter til returneringen.</p>
<p><strong>Fortrydelse af en del af købet</strong><br>Har du købt flere varer, kan du sende én eller flere af dem retur, selvom de er købt i én ordre. Bemærk, at du ikke får fragten retur, hvis du kun fortryder en del af dit køb.</p>''')
    add('Ingen fortrydelsesret', '''<p>Følgende aftaler kan ikke fortrydes:</p>
<ul><li>Levering af fødevarer, drikkevarer eller andre varer til husholdningens løbende forbrug, som leveres fysisk hjem til dig eller til din arbejdsplads af en erhvervsdrivende, der regelmæssigt bringer varer ud i dit område.</li>
<li>Levering af varer, som må antages at blive forringet eller forældet hurtigt.</li>
<li>Levering af forseglede varer, som af sundhedsbeskyttelses- eller hygiejnemæssige årsager ikke er egnede til at blive returneret, og hvor forseglingen er brudt efter leveringen.</li></ul>''')
    add('Returnering', f'''<p>Når du har givet os besked om, at du vil fortryde dit køb, har du 14 dage til at sende varen tilbage. Returneringen er sket rettidigt, hvis du har overdraget varen til et fragtfirma senest 14 dage efter, at du gav os besked.</p>
<p>Du betaler selv returfragten, og du hæfter for varen, hvis den bliver beskadiget under transporten.</p>
<p>Visse varer kan ikke sendes med almindelig post. Det gælder varer i glas- og plastemballage. Varer med flydende indhold skal beskyttes mod stød og sendes som pakkepost.{s['retur_glas']}</p>
<p><strong>Varens stand</strong><br>Du kan returnere varen, selvom den har været brugt, men kun i det omfang, det er nødvendigt for at afprøve den, som du ville kunne i en fysisk butik. Er varen brugt mere end det, vurderer vi varens handelsmæssige værdi, og en eventuel værdiforringelse fratrækkes tilbagebetalingen. I visse tilfælde kan det betyde, at du kun kan få fragtomkostningerne tilbage. Vi anbefaler, at du sender varen retur i den originale emballage, da manglende emballage kan medføre en værdiforringelse.</p>
<p><strong>Tilbagebetaling</strong><br>Du får dit tilgodehavende refunderet hurtigst muligt og senest 14 dage efter, at vi har modtaget din besked om, at du vil fortryde. Pengene tilbageføres til samme betalingsmiddel, som du brugte ved købet, medmindre vi har aftalt andet. Vi kan tilbageholde betalingen, indtil vi har modtaget varen, eller du har sendt dokumentation for, at den er returneret.</p>''')
    add('Reklamation', f'''<p>Du har som forbruger 2 års reklamationsret fra modtagelsen af varen. Det betyder, at du kan klage over fejl og mangler, der viser sig op til 2 år efter, at du modtog varen. Du skal reklamere inden rimelig tid, efter du har opdaget manglen. Reklamerer du inden for 2 måneder efter, at du har opdaget fejlen, er reklamationen altid rettidig. Købelovens mangelregler kan finde anvendelse på varekøb.</p>
<p>Reklamationsretten bortfalder, hvis manglen skyldes køberen, fx forkert brug eller uautoriseret reparation.</p>
<p>Er reklamationen berettiget, kan du afhængigt af situationen få varen repareret eller ombyttet, få pengene tilbage eller få et afslag i prisen. Vi refunderer også dine rimelige fragtomkostninger. Varen skal sendes retur i forsvarlig emballage, og husk at få en kvittering for afsendelsen.</p>
<p><strong>Sådan gør du:</strong> Kontakt os, før du sender varen. Brug vores reklamationsformular, hvor du kan beskrive fejlen og vedhæfte billeder, eller skriv til {M}.</p>
<p><a class="hb-knap" href="#os-reklamation">Send en reklamation</a></p>''')
    add('Adresse til returnering og reklamationer', f'''<p>{N}<br>Ejbyvej 82B<br>4623 Lille Skensved</p>
<p>Vi modtager kun pakker, der sendes direkte til adressen. Der er ikke mulighed for afhentning eller salg fra adressen.</p>''')
    add('Klageadgang', f'''<p>Du kan få behandlet en klage ved at skrive til {M}.</p>
<p>Klagen kan derudover indbringes for Center for Klageløsning og/eller Forbrugerklagenævnet, Nævnenes Hus, Toldboden 2, 8800 Viborg. Læs mere på <a href="https://www.forbrug.dk/" target="_blank" rel="noopener">forbrug.dk</a>.</p>''')
    add('Persondatapolitik', f'''<p>Her kan du læse, hvordan {N} behandler de personoplysninger, du giver os, når du handler hos os eller bruger vores hjemmeside. Den dataansvarlige er Benjo ApS, Ejbyvej 82B, 4623 Lille Skensved.</p>
<p><strong>Hvilke oplysninger vi bruger</strong><br>Når du handler hos os, har vi brug for dit navn, din adresse, dit telefonnummer og din e-mailadresse. Vi gemmer kun de oplysninger, der er nødvendige for at gennemføre din bestilling, og alle oplysninger om kunder og bestillinger behandles fortroligt.</p>
<p><strong>Hvad vi bruger dem til</strong></p>
<ul><li>Gennemførelse af din ordre: ordrebekræftelse, forsendelse, reklamationer og returnering</li><li>Gennemførelse og verificering af betaling (oplysningerne sendes krypteret)</li><li>Administration af din profil eller brugerkonto</li><li>Nyhedsbreve, særlige tilbud og invitationer, men kun hvis du har givet dit samtykke, medmindre loven giver mulighed for at kontakte dig uden samtykke</li></ul>
<p><strong>Hvem vi deler dem med</strong><br>Vi sender varer med GLS, som bruger dit navn, telefonnummer og din e-mailadresse til at give dig besked om pakken, og dit navn og din adresse ved levering eller afhentning. Vi samarbejder desuden med andre virksomheder, der opbevarer og behandler data på vores vegne. De må ikke bruge oplysningerne til egne formål, og vi samarbejder kun med databehandlere i EU eller i lande, der kan give dine oplysninger tilstrækkelig beskyttelse. Vi sælger aldrig dine oplysninger.</p>
<p>Oplysninger kan derudover kun videregives, hvis det er påkrævet ved lov, i forbindelse med et retligt opgør, eller for at fastslå, udøve eller forsvare vores lovmæssige rettigheder.</p>
<p><strong>Hvor længe vi gemmer dem</strong><br>Af hensyn til lovkrav gemmes oplysningerne i 5 år, hvorefter de slettes. Oplysninger kan opbevares længere i anonymiseret form. Tilmelder du dig vores nyhedsbrev, kan du altid afmelde dig via linket i mailen eller ved at kontakte os, og dine oplysninger slettes derefter.</p>
<p>Det er frivilligt, om du vil give os oplysningerne, men uden dem kan vi ikke gennemføre din bestilling.</p>
<p><strong>Cookies</strong><br>Vi bruger cookies på hjemmesiden til at forbedre din oplevelse, fx ved at gøre søgning og navigation hurtigere.</p>
<p><strong>Sikkerhed</strong><br>Vi har sikkerhedsforanstaltninger, der sikrer, at oplysningerne opbevares og behandles i et sikret miljø. Kun betroede medarbejdere og databehandlere, der arbejder efter vores instruks, har adgang til dem. Du bør aldrig udlevere dine brugeroplysninger og adgangskoder til andre.</p>
<p><strong>Dine rettigheder</strong><br>Du har ret til indsigt i de oplysninger, vi behandler om dig, med visse lovbestemte undtagelser. Du kan gøre indsigelse mod behandlingen, få rettet forkerte oplysninger og i visse tilfælde få dine oplysninger slettet. Ønsker du det, eller har du spørgsmål, så skriv til {M} eller til adressen ovenfor.</p>
<p><strong>Links til andre hjemmesider</strong><br>Vores hjemmeside kan indeholde links til andre hjemmesider. Vi er ikke ansvarlige for deres indhold eller for, hvordan de behandler personoplysninger.</p>''')
    add('Ophavsret', '''<p>Indholdet på denne hjemmeside er omfattet af den danske ophavsretslovgivning. Kopiering, download, udskrift og enhver anden udnyttelse uden for ophavsrettens rammer kræver skriftligt samtykke. Downloads og kopier er kun tilladt til privat, ikke-kommerciel brug. Indhold fra tredjeparter er omfattet af tredjeparternes ophavsret. Bliver du opmærksom på en krænkelse af ophavsretten, så giv os besked, så fjerner vi indholdet straks.</p>
<p>Brug af offentliggjorte kontaktoplysninger til at sende uopfordrede reklamer, fx spam-mails, er udtrykkeligt forbudt, og vi forbeholder os retten til at tage retlige skridt.</p>''')
    add('Standardfortrydelsesformular', f'''<p>(Denne formular udfyldes og returneres kun, hvis fortrydelsesretten gøres gældende. Du kan også bruge vores <a href="#os-fortryd">digitale formular</a>.)</p>
<p>Til: {N}, Ejbyvej 82B, 4623 Lille Skensved, e-mail: {M}</p>
<p>Jeg meddeler herved, at jeg ønsker at gøre fortrydelsesretten gældende i forbindelse med min købsaftale om følgende varer:<br>______________________________________________</p>
<p>Bestilt den: ________________ Modtaget den: ________________</p>
<p>Forbrugerens navn: ______________________________<br>Forbrugerens adresse: ____________________________</p>
<p>Forbrugerens underskrift (kun hvis formularen sendes på papir): ________________ Dato: ________</p>''')

    def slug(t): return 'hb-' + re.sub(r'[^a-z0-9]+', '-', t.lower().replace('æ', 'ae').replace('ø', 'oe').replace('å', 'aa')).strip('-')[:40]
    toc = ''.join(f'<li><a href="#{slug(t)}">{t}</a></li>' for t, _ in sek)
    body = ''.join(f'<h2 class="hb-h" id="{slug(t)}">{t}</h2>\n{h}\n' for t, h in sek)
    css = f'''<style>.os-hb{{color:#222;font-size:15px;line-height:1.65;max-width:860px}}.os-hb p{{margin:0 0 12px}}.os-hb ul{{margin:0 0 12px;padding-left:20px}}.os-hb li{{margin:3px 0}}
.os-hb h2.hb-h{{font-size:1.2rem!important;color:{s['g']}!important;font-weight:700;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid {s['bd']};scroll-margin-top:90px}}
.os-hb .hb-titel{{font-size:1.6rem!important;color:{s['g']}!important;margin:4px 0 12px}}
.os-hb .hb-top{{background:{s['lg']};border:1px solid {s['bd']};border-radius:10px;padding:16px 20px;margin:0 0 18px}}.os-hb .hb-top p{{margin:0 0 10px}}
.os-hb .hb-knapper{{display:flex;flex-wrap:wrap;gap:10px;margin:4px 0 14px}}.os-hb .hb-knap{{display:inline-block;background:{s['knap']};color:#fff!important;text-decoration:none!important;font-weight:700;border-radius:6px;padding:9px 16px}}
.os-hb .hb-indhold{{columns:2 240px;column-gap:24px;margin:6px 0 0;padding-left:18px}}.os-hb .hb-indhold li{{break-inside:avoid}}.os-hb a{{color:{s['g']}}}.os-hb a.hb-knap{{color:#fff}}
.os-hb table{{border-collapse:collapse;width:100%;margin:6px 0 12px}}.os-hb td{{padding:8px 10px;border-bottom:1px solid #e6ece8;vertical-align:top}}.os-hb td.hb-pris{{text-align:right;white-space:nowrap;font-weight:700}}.os-hb .hb-lille{{font-size:.88rem;color:#666}}</style>'''
    top = f'''<div class="hb-top"><p><strong>Kort fortalt:</strong> Har du fortrudt dit køb, eller er en vare fejlbehæftet, så brug formularerne herunder. Har du spørgsmål, så skriv til os på {M}.</p>
<div class="hb-knapper"><a class="hb-knap" href="#os-fortryd">Fortryd dit køb</a><a class="hb-knap" href="#os-reklamation">Send en reklamation</a></div>
<p style="margin:0"><strong>Indhold</strong></p><ol class="hb-indhold">{toc}</ol></div>'''
    titel = '<h1 class="hb-titel">Handelsbetingelser</h1>' if k == 'os' else ''
    return f'<!--HB-START-->{css}<div class="os-hb">{titel}{top}\n{body}<p class="hb-lille">Handelsbetingelserne er senest opdateret den 31.10.2026.</p></div><!--HB-END-->'

for k in SHOPS:
    open(os.path.join(D, f'handelsbetingelser_{k}.html'), 'w').write(side(k))
    print(k, len(side(k)))
