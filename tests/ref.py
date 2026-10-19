# Independent reference: exact rational arithmetic in arc-seconds, 100k index computed directly.
import sys,random
from fractions import Fraction as F
def roman(n):
    r='';
    for v,s in [(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n>=v: r+=s; n-=v
    return r
L='ABCD'
def ref(lat,lon):  # Fractions, arc-seconds, signed
    south=lat<0; a=abs(lat)
    band=min(21,int(a//14400)); col=min(60,int((lon+648000)//21600)+1)
    E=band*14400; dx=lon-((col-1)*21600-648000); t=a-E   # offset from equator-side edge / west edge
    def cell(size_y,size_x,n):
        k=min(n-1,int(t//size_y)); c=min(n-1,int(dx//size_x))
        return (k if south else n-1-k), c
    r2,c2=cell(7200,10800,2); r6,c6=cell(2400,3600,6); r12,c12=cell(1200,1800,12)
    r24,c24=cell(600,900,24); r48,c48=cell(300,450,48); r96,c96=cell(150,225,96)
    s=' (S)' if south else ''
    base=chr(65+band)+'-'+str(col)
    p100=base+'-'+str(r12*12+c12+1)
    q50=L[(r24%2)*2+c24%2]; q25=L[(r48%2)*2+c48%2].lower(); q10=str((r96%2)*2+c96%2+1)
    return ' '.join(x+s for x in [base,base+'-'+L[r2*2+c2],base+'-'+roman(r6*6+c6+1),p100,p100+'-'+q50,p100+'-'+q50+'-'+q25,p100+'-'+q50+'-'+q25+'-'+q10])
def dms(sec):  # Fraction arcsec (multiple of 1/100) -> "D M S"
    d=int(sec//3600); m=int((sec-d*3600)//60); s=sec-d*3600-m*60
    return f"{d} {m} {float(s):.2f}".rstrip('0').rstrip('.')
random.seed(int(sys.argv[1]))
pts=[]
# random points at 0.01" resolution
for _ in range(60000):
    pts.append((F(random.randint(0,88*360000),100),F(random.randint(0,180*360000),100)))
# exact sheet edges: every multiple of 150" lat / 225" lon (1:10k edges), plus ±0.01"
for _ in range(60000):
    la=F(150*random.randint(0,88*24)); lo=F(225*random.randint(0,180*16))
    dla,dlo=random.choice([-1,0,1])*F(1,100),random.choice([-1,0,1])*F(1,100)
    pts.append((min(F(88*3600),max(F(0),la+dla)),min(F(180*3600),max(F(0),lo+dlo))))
inp=open('in.txt','w'); exp=open('exp.txt','w')
for la,lo in pts:
    lh=random.choice([1,-1]); oh=random.choice([1,-1])
    inp.write(f"{dms(la)}|{lh}|{dms(lo)}|{oh}\n"); exp.write(ref(la*lh,lo*oh)+'\n')
