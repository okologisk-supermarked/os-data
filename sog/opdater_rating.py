# Opdaterer Google-bedømmelsen (badge + popup) i sog/sog.js ud fra teksten på Googles butikssider.
# Brug: python3 -I sog/opdater_rating.py os_tekst.txt he_tekst.txt
#   *_tekst.txt = sidetekst fra https://www.google.com/storepages?q=<domæne>&c=DK&v=19&hl=da
# Skriver kun, hvis tallene er gyldige og ændret. Udskriver "uændret", "opdateret ..." eller "FEJL ...".
import re, sys, os

SOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sog.js')


def tal(tekst):
    t = tekst.replace('\u00a0', ' ')
    m = re.search(r'(\d[,.]\d)\s*\n?\s*butiksbedømmelse\s*\((\d[\d.]*)\s*anmeldelser\)', t)
    if not m:
        raise ValueError('score/antal ikke fundet')
    s = m.group(1).replace('.', ',')
    n = int(m.group(2).replace('.', ''))
    f = []
    for st in (5, 4, 3, 2, 1):
        mm = re.search(r'\n\s*%d\s*\n\s*(\d{1,3})\s*%%' % st, t)
        if not mm:
            raise ValueError('fordeling for %d stjerner ikke fundet' % st)
        f.append(int(mm.group(1)))
    v = float(s.replace(',', '.'))
    if not (1 <= v <= 5) or n < 1 or not (90 <= sum(f) <= 110):
        raise ValueError('urimelige tal: %s %s %s' % (s, n, f))
    return s, n, f


def main():
    os_, he_ = tal(open(sys.argv[1], encoding='utf-8').read()), tal(open(sys.argv[2], encoding='utf-8').read())
    js = open(SOG, encoding='utf-8').read()
    m = re.search(r'var OS_RATING=HE\?\{s:"[^"]*",n:\d+,f:\[[\d,]+\],(d:"helsekost-ekspres\.dk",nv:"[^"]*")\}:\{s:"[^"]*",n:\d+,f:\[[\d,]+\],(d:"okologisk-supermarked\.dk",nv:"[^"]*")\};', js)
    if not m:
        print('FEJL: OS_RATING-linjen blev ikke fundet i sog.js'); sys.exit(1)
    ny = 'var OS_RATING=HE?{s:"%s",n:%d,f:[%s],%s}:{s:"%s",n:%d,f:[%s],%s};' % (
        he_[0], he_[1], ','.join(map(str, he_[2])), m.group(1), os_[0], os_[1], ','.join(map(str, os_[2])), m.group(2))
    if ny == m.group(0):
        print('uændret: ØS %s (%d), HE %s (%d)' % (os_[0], os_[1], he_[0], he_[1])); return
    open(SOG, 'w', encoding='utf-8').write(js.replace(m.group(0), ny))
    print('opdateret: ØS %s (%d) %s, HE %s (%d) %s' % (os_[0], os_[1], os_[2], he_[0], he_[1], he_[2]))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('FEJL:', e); sys.exit(1)
