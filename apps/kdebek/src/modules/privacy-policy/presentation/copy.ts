type PrivacyPolicyLink = { href: string; label: string };

type PrivacyPolicyParagraph = string | readonly (string | PrivacyPolicyLink)[];

type PrivacyPolicySection = {
  id: string;
  title: string;
  paragraphs: PrivacyPolicyParagraph[];
};

const sections = [
  {
    id: 'postanowienia-ogolne',
    title: '1. Postanowienia ogólne',
    paragraphs: [
      'Niniejsza Polityka Prywatności opisuje zasady przetwarzania danych osobowych oraz wykorzystywania plików cookie w związku z korzystaniem ze strony internetowej masazysta-olsztyn.pl.',
      'Administratorem danych osobowych jest Kacper Dębek, prowadzący gabinet masażu pod adresem ul. Profesorska 9A, 10-080 Olsztyn. W sprawach związanych z przetwarzaniem danych osobowych można kontaktować się pod adresem e-mail biuro.masazdebek@gmail.com lub telefonicznie pod numerem +48 666 735 220.',
    ],
  },
  {
    id: 'jakie-dane-zbieramy',
    title: '2. Jakie dane zbieramy',
    paragraphs: [
      'Zbieramy dane, które przekazujesz nam samodzielnie, np. kontaktując się z nami mailowo lub telefonicznie — mogą to być imię i nazwisko, adres e-mail, numer telefonu oraz treść wiadomości.',
      'Zbieramy również dane gromadzone automatycznie podczas korzystania ze strony, takie jak adres IP, rodzaj przeglądarki i urządzenia, przybliżona lokalizacja oraz informacje o sposobie korzystania ze strony — za pośrednictwem plików cookie, opisanych w dalszej części niniejszej Polityki. Dostawca hostingu rejestruje ponadto logi serwera (adres IP, user agent, czas żądania i adres URL), które przetwarzamy w celu zapewnienia bezpieczeństwa i diagnostyki strony (art. 6 ust. 1 lit. f RODO) i przechowujemy przez 7 dni.',
      'Nie przetwarzamy szczególnych kategorii danych (danych wrażliwych, w tym danych o stanie zdrowia) inaczej niż w zakresie, w jakim samodzielnie przekażesz je nam w wiadomości lub w trakcie wizyty w gabinecie — takie dane wykorzystywane są wyłącznie w celu prawidłowego przeprowadzenia zabiegu i nie są przechowywane w systemach strony internetowej.',
    ],
  },
  {
    id: 'cele-i-podstawy',
    title: '3. Cele i podstawy prawne przetwarzania danych',
    paragraphs: [
      'Dane osobowe przetwarzamy w celu: udzielenia odpowiedzi na przesłaną wiadomość (podstawa prawna: art. 6 ust. 1 lit. b i f RODO — działania podejmowane na Twoje żądanie oraz nasz prawnie uzasadniony interes w postaci obsługi korespondencji), zapewnienia prawidłowego i bezpiecznego działania strony oraz analizy ruchu (art. 6 ust. 1 lit. f RODO), a także — wyłącznie za Twoją zgodą — w celu analizy statystyk odwiedzin (Cloudflare Web Analytics) oraz wyświetlenia osadzonego filmu YouTube (art. 6 ust. 1 lit. a RODO). Nie przetwarzamy danych w celach marketingowych ani reklamowych.',
      'Podanie danych jest zawsze dobrowolne, jednak w niektórych przypadkach niezbędne do tego, abyśmy mogli odpowiedzieć na Twoje zapytanie.',
    ],
  },
  {
    id: 'rezerwacja-wizyt',
    title: '4. Rezerwacja wizyt online',
    paragraphs: [
      'Rezerwacja wizyt odbywa się za pośrednictwem zewnętrznej platformy Booksy, prowadzonej przez odrębnego administratora danych (Booksy International sp. z o.o.). Dane podane podczas rezerwacji (np. imię i nazwisko, numer telefonu, adres e-mail) są przetwarzane przez Booksy na zasadach opisanych w jego własnej polityce prywatności, dostępnej na stronie booksy.com.',
      'Strona masazysta-olsztyn.pl jedynie przekierowuje do platformy Booksy i nie przechowuje danych podanych w procesie rezerwacji.',
    ],
  },
  {
    id: 'linki-zewnetrzne',
    title: '5. Linki do serwisów zewnętrznych',
    paragraphs: [
      'Strona zawiera odnośniki do serwisów zewnętrznych, m.in. Booksy, Map Google i opinii Google, Facebooka, Instagrama, LinkedIna oraz kanału YouTube. Po kliknięciu odnośnika opuszczasz stronę, a dany serwis jest odrębnym administratorem Twoich danych i przetwarza je na zasadach określonych w swojej polityce prywatności.',
    ],
  },
  {
    id: 'cookies',
    title: '6. Pliki cookie i podobne technologie',
    paragraphs: [
      'Strona wykorzystuje dwie kategorie: niezbędne (zapamiętanie Twojego wyboru zgód w localStorage, klucz kdebek:cookie-consent, do 12 miesięcy; zawsze aktywne) oraz wydajnościowe (Cloudflare Web Analytics — statystyki odwiedzin i źródeł ruchu; ładowane wyłącznie po Twojej zgodzie). Nie stosujemy cookies marketingowych ani reklamowych.',
      [
        'Dodatkowo w sekcji oferty osadzony jest film YouTube (youtube-nocookie.com). Nie ładuje się on automatycznie — dopiero po kliknięciu przycisku „Załaduj film” Twoja przeglądarka łączy się z serwerami Google, które otrzymują wtedy Twój adres IP i dane techniczne (np. rodzaj przeglądarki), a Google i YouTube mogą korzystać z własnych plików cookie lub podobnych technologii. W tym zakresie Google działa jako odrębny administrator danych — szczegóły znajdziesz w polityce prywatności Google: ',
        {
          href: 'https://policies.google.com/privacy',
          label: 'policies.google.com/privacy',
        },
        '. Wybór nie jest zapamiętywany, a brak kliknięcia oznacza brak połączenia z YouTube.',
      ],
      'Zgodę możesz udzielić lub odrzucić jednym kliknięciem w banerze, a następnie w każdej chwili zmienić za pomocą przycisku ustawień cookies dostępnego na stronie. Odmowa nie ogranicza działania strony.',
    ],
  },
  {
    id: 'odbiorcy-danych',
    title: '7. Odbiorcy danych',
    paragraphs: [
      'Dostęp do danych mogą mieć podmioty świadczące na naszą rzecz usługi hostingowe, techniczne i analityczne, wyłącznie w zakresie niezbędnym do prawidłowego świadczenia tych usług i na podstawie zawartych z nimi umów powierzenia przetwarzania danych.',
      'Dostawcą hostingu i sieci CDN jest Cloudflare, który przetwarza dane (w tym logi serwera) jako podmiot przetwarzający na podstawie umowy powierzenia przetwarzania danych; ten sam dostawca świadczy usługę Cloudflare Web Analytics (statystyki bez plików cookie), uruchamianą wyłącznie po Twojej zgodzie. Dane mogą być przekazywane do USA — na podstawie decyzji Komisji Europejskiej w sprawie Programu Ochrony Danych UE–USA (EU-US Data Privacy Framework) lub standardowych klauzul umownych.',
      'Po kliknięciu „Załaduj film” odbiorcą Twojego adresu IP i danych technicznych jest Google (YouTube) jako odrębny administrator, a po wejściu na Booksy — Booksy jako odrębny administrator (zob. sekcje 4 i 5).',
      'Dane mogą zostać ujawnione podmiotom uprawnionym na podstawie przepisów prawa, jeżeli wystąpią z takim żądaniem w oparciu o odpowiednią podstawę prawną.',
      'Nie sprzedajemy danych osobowych podmiotom trzecim.',
    ],
  },
  {
    id: 'okres-przechowywania',
    title: '8. Okres przechowywania danych',
    paragraphs: [
      'Dane przekazane w korespondencji mailowej lub telefonicznej przechowujemy przez czas niezbędny do udzielenia odpowiedzi oraz przez okres wynikający z ewentualnych obowiązków archiwizacyjnych.',
      'Logi serwera przechowywane są przez 7 dni, a następnie usuwane.',
      'Dane zbierane za pośrednictwem plików cookie przechowywane są przez okres wskazany w ustawieniach Twojej przeglądarki lub do momentu wycofania zgody, nie dłużej jednak niż przez 12 miesięcy od momentu jej udzielenia.',
    ],
  },
  {
    id: 'twoje-prawa',
    title: '9. Twoje prawa',
    paragraphs: [
      'Zgodnie z RODO przysługuje Ci prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec ich przetwarzania.',
      'Jeżeli przetwarzanie odbywa się na podstawie zgody, masz prawo w każdej chwili ją wycofać, co nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.',
      'Przysługuje Ci również prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, jeżeli uznasz, że przetwarzanie Twoich danych narusza obowiązujące przepisy.',
    ],
  },
  {
    id: 'bezpieczenstwo',
    title: '10. Bezpieczeństwo danych',
    paragraphs: [
      'Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych, w tym połączenie szyfrowane SSL/TLS oraz ograniczony dostęp do danych.',
      'Mimo stosowanych zabezpieczeń żadna metoda transmisji ani przechowywania danych w internecie nie jest w pełni bezpieczna — dokładamy jednak wszelkich starań, aby chronić Twoje dane przed nieuprawnionym dostępem.',
    ],
  },
  {
    id: 'zmiany',
    title: '11. Zmiany w Polityce Prywatności',
    paragraphs: [
      'Niniejsza Polityka Prywatności może być okresowo aktualizowana, w szczególności w związku ze zmianą przepisów prawa lub zakresu świadczonych usług. Aktualna wersja jest zawsze dostępna na tej stronie wraz z datą ostatniej aktualizacji.',
    ],
  },
  {
    id: 'kontakt',
    title: '12. Kontakt',
    paragraphs: [
      'W sprawach dotyczących niniejszej Polityki Prywatności oraz przetwarzania danych osobowych możesz skontaktować się z nami pod adresem e-mail biuro.masazdebek@gmail.com, telefonicznie pod numerem +48 666 735 220 lub listownie na adres: ul. Profesorska 9A, 10-080 Olsztyn.',
    ],
  },
] satisfies PrivacyPolicySection[];

export const copy = {
  meta: {
    author: 'GreenOn Software Adrian Połubiński',
    siteName:
      'Kacper Dębek — masaż leczniczy i klasyczny | masazysta-olsztyn.pl',
    title: 'Polityka prywatności — Kacper Dębek',
    description:
      'Polityka prywatności i cookies gabinetu masażu Kacper Dębek w Olsztynie — jakie dane zbieramy, w jakim celu je przetwarzamy oraz jakie prawa Ci przysługują.',
    keywords:
      'polityka prywatności, polityka cookies, RODO, ochrona danych osobowych, administrator danych, zgoda na cookies, przetwarzanie danych, pliki cookie, Kacper Dębek, gabinet masażu Olsztyn, masaż Olsztyn, masazysta-olsztyn.pl, Booksy rezerwacja',
    imageAlt: 'Kacper Dębek — masażysta',
  },

  header: {
    eyebrow: 'DOKUMENT PRAWNY',
    heading: 'Polityka prywatności',
    lastUpdated: 'Ostatnia aktualizacja: 26 października 2026',
  },

  sections,
} as const;
