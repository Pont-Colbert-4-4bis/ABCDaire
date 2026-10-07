"""Build editable Blender master, portable GLB, compressed web GLB and review renders.
Run: Blender --background --factory-startup --python model/build_colbert.py -- OUTPUT_DIR
All dimensions are photo-derived estimates, not survey measurements. No photo textures.
Internal coordinates are glTF Y-up; B() converts to Blender Z-up.
"""
import bpy, math, random, json, sys, os
from pathlib import Path
from collections import defaultdict
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[sys.argv.index('--')+1]) if '--' in sys.argv else ROOT/'model/output'
OUT.mkdir(parents=True,exist_ok=True)
WEB=ROOT/'assets/models';WEB.mkdir(parents=True,exist_ok=True)
random.seed(44)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes,bpy.data.materials,bpy.data.curves):
 for d in list(datablocks):
  if d.users==0:datablocks.remove(d)

def B(p):return (p[0],-p[2],p[1])
def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
M={}
def material(name,hexcode,rough=.8,metal=0):
 color=tuple(linear(int(hexcode[i:i+2],16)/255) for i in (0,2,4))
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1)
 bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 M[name]=m;return m
for name,color in {'enduit':'d2d0c5','saumon':'c48b6d','saumon_clair':'ca9678','couronnement':'bbb9ad','cadres':'e6e5df','retrait':'444b49','volet':'e1e0d8','toit':'bab9ad','etancheite':'a4a59e','pavage':'b1ada0','joint':'908d84','asphalte':'918a85','marquage':'d4cbae','bus':'293c32','tronc':'726654','terre':'5b5944','metal':'878d86','grille':'a5a9a2','vitre1':'607e8a','vitre2':'899b9e','vitre3':'435967','rideau':'cecec4','vitre_bus':'a7b7b5','feuille1':'3b5638','feuille2':'506347','feuille3':'657452','feuille4':'2e4833','borne':'ad493c','blanc':'dfdfd5'}.items():material(name,color,.32 if name.startswith('vitre') else .84,.15 if name in ['metal','grille'] else 0)

# Material batching inside named, editable architectural components.
meshes={};counts=defaultdict(int)
def geom(part,mat,verts,faces,smooth=False):
 key=(part,mat,smooth)
 if key not in meshes:meshes[key]=[[],[]]
 v,f=meshes[key];n=len(v);v.extend(B(p) for p in verts);f.extend(tuple(n+i for i in face) for face in faces)
def box(part,mat,w,h,d,x,y,z,angle=0):
 verts=[]
 for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
  xx=a*w/2;zz=c*d/2;verts.append((x+xx*math.cos(angle)+zz*math.sin(angle),y+b*h/2,z-xx*math.sin(angle)+zz*math.cos(angle)))
 geom(part,mat,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
def prism(part,mat,points,bottom,top):
 n=len(points);geom(part,mat,[(x,bottom,z) for x,z in points]+[(x,top,z) for x,z in points],[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)])
def rod(part,mat,a,b,r=.035,r2=None,segments=7):
 a=Vector(a);b=Vector(b);direction=(b-a).normalized();u=direction.cross(Vector((0,1,0)))
 if u.length<.001:u=direction.cross(Vector((1,0,0)))
 u.normalize();v=direction.cross(u);r2=r if r2 is None else r2
 pts=[tuple(p+(u*math.cos(t*math.tau/segments)+v*math.sin(t*math.tau/segments))*radius) for p,radius in [(a,r),(b,r2)] for t in range(segments)]
 geom(part,mat,pts,[tuple(range(segments-1,-1,-1)),tuple(range(segments,segments*2))]+[(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)],True)
def edgewall(part,mat,a,b,bottom,height,thickness=.14):
 dx=b[0]-a[0];dz=b[1]-a[1];box(part,mat,math.hypot(dx,dz),height,thickness,(a[0]+b[0])/2,bottom+height/2,(a[1]+b[1])/2,-math.atan2(dz,dx))
def railing(part,a,b,y,height=1.02):
 length=math.dist(a,b);n=max(2,math.ceil(length/.17))
 for lift,r in [(height,.029),(.1,.022)]:rod(part,'metal',(a[0],y+lift,a[1]),(b[0],y+lift,b[1]),r)
 for j in range(n+1):
  t=j/n;x=a[0]+(b[0]-a[0])*t;z=a[1]+(b[1]-a[1])*t;rod(part,'metal',(x,y,z),(x,y+height,z),.018,segments=5)
def facebox(part,mat,w,h,d,u,y,depth,origin=(0,0),angle=0):
 x=origin[0]+u*math.cos(angle)+depth*math.sin(angle);z=origin[1]-u*math.sin(angle)+depth*math.cos(angle)
 box(part,mat,w,h,d,x,y,z,angle)
def window(part,u,y,w=1.5,h=1.35,origin=(0,0),angle=0,seed=0,door=False):
 # Reveal, frame, recessed glass, mullion, sill and roller shutter housing.
 counts['windows']+=1
 fb=lambda mat,ww,hh,dd,xx,yy,zz:facebox(part,mat,ww,hh,dd,xx,yy,zz,origin,angle)
 fb('retrait',w+.17,h+.17,.075,u,y,.015)
 fb('vitre'+str(seed%3+1),w-.08,h-.08,.04,u,y,.061)
 for dx in [-w/2,0,w/2]:fb('cadres',.047,h+.06,.115,u+dx,y,.11)
 for dy in [-h/2,h/2]:fb('cadres',w+.08,.047,.115,u,y+dy,.11)
 fb('enduit',w+.23,.075,.24,u,y-h/2-.065,.09)
 fb('couronnement',w+.16,.02,.07,u,y-h/2-.11,.055)
 fb('cadres',w+.1,.1,.12,u,y+h/2+.045,.065)
 state=seed%11
 if state in [0,3,7] and not door:
  hh=h*(1 if state==0 else .64 if state==3 else .35)
  fb('volet',w-.055,hh,.025,u,y+h/2-hh/2,.138)
  for j in range(1,int(hh/.075)):fb('couronnement',w-.07,.009,.009,u,y+h/2-j*.075,.154)
 elif state in [1,4,6,9]:
  ww=w*(.31 if state%2 else .65);fb('rideau',ww,h-.14,.007,u-w/2+ww/2+.05,y,.088)
  for j in range(1,int(ww/.13)):fb('volet',.018,h-.16,.009,u-w/2+j*.13,y,.094)
def balcony(part,u,y,w,depth=1.5,flip=False,metal_end=False,origin=(0,0),angle=0):
 counts['triangular_balconies']+=1
 local=[(-w/2,0),(w/2,0),(-w/2 if flip else w/2,depth)]
 points=[(origin[0]+(u+x)*math.cos(angle)+z*math.sin(angle),origin[1]-(u+x)*math.sin(angle)+z*math.cos(angle)) for x,z in local]
 prism(part,'enduit',points,y-.16,y)
 for i,j in [(1,2),(2,0)]:
  is_short=abs(local[i][0]-local[j][0])<.01
  if metal_end and is_short:railing(part,points[i],points[j],y+.02,.99)
  else:
   edgewall(part,'enduit',points[i],points[j],y,1.01,.115)
   edgewall(part,'couronnement',points[i],points[j],y+1.01,.035,.14)
 # The underside is an actual triangular slab, not a rectangular shelf.

# Ground and street (no slab blocking either descending garage ramp).
box('Socle','pavage',69,.35,8.5,-5.2,-.34,11.8)
box('Trottoir','pavage',48,.17,4.05,1.6,-.045,6.75)
box('Rue','asphalte',69,.12,6.3,-5.2,-.15,12.7)
for x in range(-39,29):
 if not -35<x<-23:box('Bordure','enduit',.94,.20,.27,x,-.02,8.75)
box('Acces_parkings','pavage',11.6,.14,1.40,-28.35,-.055,8.05)
for x in range(-38,28,6):box('Rue','blanc',2.9,.012,.09,x,-.077,14.4)
for x in [-5.5,.5,6.5,12.5]:
 for a,b in [((x,11.2),(x+2,9.4)),((x+2,9.4),(x+5.8,9.4))]:edgewall('Rue','marquage',a,b,-.075,.013,.07)
# Footprint combines the long street bar with the deeper, stepped left return.
foot=[(-22.2,0),(22.2,0),(22.2,-10.9),(-11.9,-10.9),(-15.5,-14.2),(-15.5,-18),(-25.3,-18),(-25.3,-8.7),(-22.2,-8.7)]
prism('Batiment_principal','enduit',foot,.2,15.8)
prism('Toiture_basse','toit',foot,15.8,15.88)
for a,b in zip(foot,foot[1:]+foot[:1]):edgewall('Acrotere','enduit',a,b,15.83,.30,.17)
# Continuous peach bands on alternating storeys, local infill on the others.
origins=[((0,0),0,44.4),((-22.2,-4.35),-math.pi/2,8.7),((-25.3,-13.35),-math.pi/2,9.3),((-23.75,-8.7),0,3.1)]
for origin,angle,width in origins:
 facebox('Bandes_facades','saumon',width,1.6,.027,0,1.08,.008,origin,angle)
 for floor in [1,3]:facebox('Bandes_facades','saumon',width,1.47,.029,0,3.85+floor*2.62,.011,origin,angle)
 for floor in range(6):facebox('Joints_facades','couronnement',width,.014,.018,0,2.36+floor*2.62,.029,origin,angle)
for x in [-20.8,-8.7,1.0,10.6,21.2]:box('Joints_facades','couronnement',.013,15.35,.013,x,8,.021)
# Street windows: explicit axes matched across the supplied frontal photos.
axes=[(-20.0,1.8),(-13.6,2.75),(-8.7,1.58),(-5.4,2.55),(0,2.5),(4.15,1.64),(9.0,1.78),(14.8,2.4),(18.7,2.6)]
for floor in range(5):
 y=3.85+floor*2.62
 for i,(x,w) in enumerate(axes):
  if floor%2==0 and i in [0,2,4,6,8]:box('Panneaux_facades','saumon_clair',2.2,1.47,.029,x+1.12,y,.01)
  window('Menuiseries_rue',x,y,w,1.35 if i not in [0,6] else 1.91,seed=i*3+floor*7,door=i in [0,6])
 for col,(x,w,depth,flip,rail) in enumerate([(-20,1.95,1.30,True,True),(-6.9,4.75,1.50,False,False),(9.0,2.05,1.36,False,True),(18.0,4.55,1.5,True,False)]):
  balcony('Balcons_rue_'+str(col+1),x,2.66+floor*2.62,w,depth,flip,rail)
 # Two distinct west-facing planes of the stepped return.
 for origin,positions,balcony_u in [((-22.2,-4.35),[-2.5,1.45],1.0),((-25.3,-13.35),[-2.95,.35,2.9],-.65)]:
  for i,x in enumerate(positions):
   if floor%2==0:facebox('Panneaux_facades','saumon_clair',1.4,1.47,.028,x+.7,y,.01,origin,-math.pi/2)
   window('Menuiseries_retour',x,y,1.8 if i!=1 else 1.3,1.35,origin,-math.pi/2,seed=floor*3+i)
  balcony('Balcons_retour_'+str(origin[0]),balcony_u,2.66+floor*2.62,4.15,1.45,False,False,origin,-math.pi/2)
for i,(x,w) in enumerate(axes):
 if abs(x+20)<1 or abs(x-9)<1:continue
 window('Rez_de_chaussee',x,1.15,w*.75,.99,seed=i)
for origin,angle,width in origins[1:3]:
 for i,u in enumerate([-2.7,.1,2.6]):window('Rez_de_chaussee',u,1.15,1.4,1.0,origin,angle,seed=i+3)
# Attic: inset sixth floor, narrow horizontal windows, peripheral roof terrace.
attic=[(-21.05,-1.05),(21.15,-1.05),(21.15,-9.85),(-12.2,-9.85),(-16.6,-13.85),(-16.6,-16.95),(-24.2,-16.95),(-24.2,-9.85),(-21.05,-9.85)]
prism('Attique','enduit',attic,15.9,18.02);prism('Toit_terrasse','toit',attic,18.02,18.08)
box('Attique','saumon',42.18,.81,.025,.05,16.79,-1.029)
for i,x in enumerate([-18.9,-14.8,-10.4,-6.2,-1.9,2.3,6.6,10.8,15.1,19.1]):window('Menuiseries_attique',x,16.81,1.55,.75,(0,-1.03),seed=i+2)
for a,b in zip(attic,attic[1:]+attic[:1]):edgewall('Acrotere_attique','enduit',a,b,18.02,.27,.18)
# Low waterproofing upstands and joints visible around the roof service routes.
for start,end in [(-19,-1.5),(1.4,19)]:
 for a,b in [((start,-3),(end,-3)),((start,-8.0),(end,-8.0)),((start,-3),(start,-8)),((end,-3),(end,-8))]:
  edgewall('Releves_toiture','etancheite',a,b,18.085,.055,.065)
for x in [-10.6,0,10.7]:edgewall('Releves_toiture','couronnement',(x,-1.1),(x,-9.8),18.084,.012,.028)
# Only roofs/volumes seen from above are reconstructed at the hidden rear.
for x,z in [(-17.9,-10.8),(8.1,-5.6)]:
 box('Noyaux_toiture','enduit',3.45,1.18,3.55,x,18.68,z)
 box('Noyaux_toiture','couronnement',3.7,.12,3.8,x,19.29,z)
 box('Noyaux_toiture','metal',.62,.43,.7,x+1.35,19.45,z-.8)
 for j in range(3):box('Noyaux_toiture','retrait',.47,.035,.025,x+.3,18.5+j*.11,z+1.782)
for x in [-19.5,7.5]:
 rod('Antenne','metal',(x,18.3,-4),(x,20.1,-4),.024)
 for y in [19.35,19.65]:rod('Antenne','metal',(x-.6,y,-4),(x+.6,y,-4),.018)
 for j in range(5):rod('Antenne','metal',(x-.5+j*.25,19.65,-4.3),(x-.5+j*.25,19.65,-3.7),.01)
# Rear silhouette is intentionally restrained: geometry from aerial, no guessed windows.
for x in [-11,-3.0,6.5,15.4]:
 for floor in range(5):balcony('Balcons_arriere_estimes',x,2.66+floor*2.62,2.8,1.15,floor%2==0,True,(0,-10.92),math.pi)

# Entrances are actual separate labelled glazed door assemblies and paths.
def label(text,x,y,z,size=.25,angle=0,part='Signaletique',mat='cadres'):
 curve=bpy.data.curves.new(text,'FONT');curve.body=text;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=size;curve.extrude=.001
 ob=bpy.data.objects.new(part+'_'+text,curve);bpy.context.collection.objects.link(ob);ob.location=B((x,y,z));ob.rotation_euler=(math.pi/2,0,angle);ob.data.materials.append(M[mat]);ob['asset']=True
def entrance(x,name,stairs):
 counts['entrances']+=1;part='Entree_'+name.replace(' ','_')
 box(part,'retrait',2.45,2.45,.18,x,1.38,.018)
 box(part,'vitre3',2.19,2.18,.055,x,1.35,.135)
 for dx in [-1.14,-.35,.43,1.14]:box(part,'metal',.065,2.26,.09,x+dx,1.35,.182)
 for dy in [.24,2.45]:box(part,'metal',2.35,.07,.1,x,dy,.18)
 rod(part,'cadres',(x+.28,.96,.27),(x+.28,1.38,.27),.018)
 box(part,'enduit',3.0,.16,1.0,x,2.66,.4)
 box(part,'metal',.26,.53,.05,x+1.43,1.40,.13)
 for j in range(6):box(part,'retrait',.09,.035,.019,x+1.43,1.22+j*.066,.165)
 box(part,'bus',.62,.36,.035,x,2.39,.227);label(name,x,2.4,.25,.25)
 if stairs:
  for i in range(5):box(part,'pavage',2.55,.14,3.2-i*.5,x,.035+i*.14,3.17-i*.25)
  for side in [-1,1]:railing(part,(x+side*1.42,4.5),(x+side*1.42,.95),.26,.83)
 else:box(part,'pavage',2.8,.12,4.3,x,.01,2.6)
entrance(-20.0,'4 bis',False);entrance(9.0,'4',True)

# Raised left terrace, two physically open portals and ramps at different levels.
garage_z=1.95
# Closed garage facade: a continuous backing behind both closed portals.
box('Parkings','saumon',11.55,4.73,.25,-28.2,.775,garage_z-.22)
box('Parkings','saumon',11.5,.58,.32,-28.15,2.86,garage_z-.08)
box('Parkings','saumon',3.60,1.99,.32,-31.15,1.575,garage_z-.08)
box('Parkings','saumon',1.1,2.75,.40,-33.5,.96,garage_z-.07)
box('Parkings','saumon',1.18,2.78,.38,-28.9,.93,garage_z-.07)
box('Parkings','saumon',1.15,2.78,.38,-22.9,.93,garage_z-.07)
box('Terrasse_parkings','enduit',11.75,.28,5.5,-28.1,3.26,-.50)
box('Terrasse_parkings','toit',11.3,.06,5.15,-28.1,3.42,-.55)
railing('Terrasse_parkings',(-33.8,2.18),(-22.32,2.18),3.4,.93)
railing('Terrasse_parkings',(-33.8,2.18),(-33.8,-3.22),3.4,.93)
for x,width,bottom,name in [(-31.15,3.4,-1.48,'bas'),(-25.7,4.35,.38,'haut')]:
 part='Parking_'+name;counts['garage_doors']+=1
 box(part,'retrait',width+.20,2.22,.18,x,bottom+1.11,garage_z+.07)
 box(part,'grille',width,2.06,.12,x,bottom+1.06,garage_z+.2)
 for j in range(int(width/.13)):
  xx=x-width/2+.07+j*.13;box(part,'metal',.018,1.58,.025,xx,bottom+.91,garage_z+.27)
  box(part,'retrait',.065,.31,.035,xx,bottom+1.86,garage_z+.28)
 box(part,'metal',width+.1,.06,.19,x,bottom+.02,garage_z+.23)
 # Ramp slopes to the same sidewalk elevation, with individual retaining walls.
 near=7.45;far=2.26;w=width+.08
 geom(part,'pavage',[(x-w/2,0,near),(x+w/2,0,near),(x+w/2,bottom,far),(x-w/2,bottom,far),(x-w/2,-1.65,near),(x+w/2,-1.65,near),(x+w/2,-1.65,far),(x-w/2,-1.65,far)],[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)])
 for side in [-1,1]:
  xx=x+side*(w/2+.14)
  geom(part,'enduit',[(xx-.12,0,near),(xx+.12,0,near),(xx+.12,bottom,far),(xx-.12,bottom,far),(xx-.12,.55,near),(xx+.12,.55,near),(xx+.12,bottom+1.05,far),(xx-.12,bottom+1.05,far)],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)])
 for row in range(20):
  zz=far+(near-far)*(row+.5)/20;yy=bottom*(near-zz)/(near-far)+.008
  for col in range(10):box(part,'joint',.009,.01,(near-far)/20-.015,x-w/2+w*(col+.5+(row%2)*.25)/10,yy,zz)
  box(part,'joint',w,.009,.012,x,yy,zz)
# Planted divider and retaining infill between the two sloping access lanes.
geom('Separateur_parkings','enduit',[(-29.38,.46,7.45),(-27.92,.46,7.45),(-27.92,1.38,2.25),(-29.38,1.38,2.25),(-29.38,-1.65,7.45),(-27.92,-1.65,7.45),(-27.92,-1.65,2.25),(-29.38,-1.65,2.25)],[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)])
box('Separateur_parkings','enduit',2.10,.53,.25,-28.63,.25,7.45)
# Long retaining wall alongside the descending ramp, its top ramps up towards terrace.
geom('Mur_parking','enduit',[(-34.12,0,7.9),(-34.12,3.28,1.6),(-34.12,3.28,-3.2),(-34.12,-1.55,-3.2),(-34.12,-1.55,7.9),(-34.4,0,7.9),(-34.4,3.28,1.6),(-34.4,3.28,-3.2),(-34.4,-1.55,-3.2),(-34.4,-1.55,7.9)],[(0,1,2,3,4),(9,8,7,6,5),(0,5,6,1),(1,6,7,2),(2,7,8,3),(3,8,9,4),(4,9,5,0)])
rod('Mur_parking','couronnement',(-34.25,.05,7.9),(-34.25,3.36,1.6),.07,segments=4)

# Planting with openings aligned to the two doors, not a continuous hedge across them.
def foliage(part,x,y,z,rx,ry,rz,count):
 for i in range(count):
  phi=random.random()*math.tau;cy=random.uniform(-1,1);rr=random.random()**(1/3);sin=math.sqrt(1-cy*cy)
  xx=x+rx*rr*math.cos(phi)*sin;yy=y+ry*rr*cy;zz=z+rz*rr*math.sin(phi)*sin;s=random.uniform(.06,.18)
  # Low-poly leaf clusters, batched by colour instead of thousands of objects.
  pts=[(xx,yy+s*.55,zz),(xx+s,yy,zz),(xx,yy,zz+s*.65),(xx-s,yy,zz),(xx,yy,zz-s*.65),(xx,yy-s*.55,zz)]
  geom(part,'feuille'+str(random.randrange(1,5)),pts,[(0,1,2),(0,2,3),(0,3,4),(0,4,1),(5,2,1),(5,3,2),(5,4,3),(5,1,4)],True)
box('Terrain','terre',44.5,.19,4.3,.05,.05,2.16)
prism('Terrain','terre',[(-35.1,-3.25),(-25.4,-3.25),(-25.4,-18.7),(-17,-21),(-12,-14),(23,-11.3),(23,-20.8),(-35.1,-20.8)],-.05,.06)
for start,end in [(-22.2,-21.55),(-18.45,7.55),(10.5,22.55)]:
 mid=(start+end)/2;w=end-start
 box('Jardinieres','enduit',w,.65,.26,mid,.36,4.50)
 box('Jardinieres','couronnement',w,.055,.33,mid,.72,4.50)
 box('Jardinieres','terre',w,.13,2.6,mid,.17,3.03)
 box('Haies','feuille4',max(.3,w-.1),.91,.90,mid,1.06,3.88)
 for x in [start+.25+j*.46 for j in range(max(1,int(w/.46)))]:foliage('Haies',x,1.28,3.88,.39,.42,.56,75)
# Grounded shrubs behind the raised terrace, kept clear of the facade.
box('Jardin_gauche','terre',2.4,.20,9.0,-26.6,.14,-8.0)
for z in [-4.6,-6,-7.6,-9.2,-10.8]:
 box('Jardin_gauche','feuille4',1.15,1.08,1.25,-26.7,.75,z)
 foliage('Jardin_gauche',-26.7,1.03,z,.76,.55,.84,160)
for x,z in [(-18.35,.95),(10.8,1.2)]:foliage('Jardinieres',x,1.05,z,.49,.65,.56,110)
def tree(x,z,height,spread,seed,forest=False):
 rng=random.Random(seed);part='Arbres_arriere' if forest else 'Arbres_rue'
 rod(part,'tronc',(x,0,z),(x+.16,height*.63,z),.16 if forest else .105,.052)
 def branch(a,vec,length,r,depth):
  b=tuple(a[k]+vec[k]*length for k in range(3));rod(part,'tronc',a,b,r,r*.50,6)
  if depth==0:return
  for j in range(3):
   v=Vector((vec[0]+rng.uniform(-.7,.7),max(.13,vec[1]+rng.uniform(-.23,.35)),vec[2]+rng.uniform(-.7,.7))).normalized()
   branch(b,v,length*.63,r*.54,depth-1)
 for j in range(8):
  angle=j*2.399;v=Vector((math.cos(angle)*.65,1.0,math.sin(angle)*.65)).normalized();a=(x,height*(.36+j*.027),z)
  branch(a,v,spread*(.7+rng.random()*.45),.044,3)
 if not forest:
  box('Arbres_rue','terre',2.1,.09,1.9,x,.06,z)
  for side in [-1,1]:
   for i in range(8):box('Arbres_rue','enduit',.24,.17,.2,x-1+i*.28,.13,z+side*.98)
   for i in range(6):box('Arbres_rue','enduit',.2,.17,.26,x+side*1.1,.13,z-.85+i*.32)
tree(-15.1,7.15,8.0,2.8,44);tree(10.3,7.12,7.9,2.7,4)
for i,(x,z,h) in enumerate([(-29,-12,13),(-27,-18,14),(-19,-21,12),(1,-16,13)]):tree(x,z,h,3.7,i+77,True)

# Bus shelter: roof, framed glazing, bench, public display without copied content.
part='Abri_bus'
for x in [-6.8,-1.7]:
 for z in [6.3,7.7]:box(part,'bus',.07,2.45,.07,x,1.225,z)
box(part,'bus',5.5,.095,1.75,-4.25,2.48,7)
box(part,'vitre_bus',4.94,1.85,.018,-4.25,1.38,6.29)
box(part,'bus',.045,1.92,.065,-4.25,1.38,6.28)
box(part,'vitre_bus',.018,1.85,1.34,-6.81,1.38,7)
for x in [-5.1,-3.5]:
 box(part,'cadres',1.12,1.20,.025,x,1.46,6.325)
 for j in range(4):box(part,'metal',.92,.025,.014,x,1.8-j*.20,6.348)
box(part,'bus',3.85,.075,.40,-4.05,.58,7.13)
for x in [-5.5,-2.6]:box(part,'bus',.06,.58,.07,x,.29,7.13)
box(part,'bus',1.3,.26,.06,-4.25,2.64,6.86);label('BUS',-4.25,2.64,6.90,.18)
box('Mobilier_rue','tronc',.37,.85,.37,-.7,.425,6.65)
for x in [-18.3,-12.1,-.8,5.0,14.4,20.4,25.5]:
 rod('Potelets','tronc',(x,0,8.25),(x,.94,8.25),.052)
 rod('Potelets','metal',(x,.94,8.25),(x,.985,8.25),.068)
# One curved-head street lamp, a parking meter, red street box by left entrance.
rod('Lampadaire','tronc',(-18.9,0,7.75),(-18.9,9.35,7.75),.075,.043)
rod('Lampadaire','metal',(-18.9,8.95,7.75),(-16.85,9.46,7.75),.041)
box('Lampadaire','metal',.85,.11,.34,-16.88,9.32,7.75)
box('Mobilier_rue','bus',.48,1.89,.35,-22.95,.945,7.45)
box('Mobilier_rue','vitre3',.38,.55,.02,-22.95,1.47,7.64);label('P',-22.95,1.60,7.66,.24)
box('Mobilier_rue','borne',.40,.88,.30,-18.18,.44,4.83)

# Create actual meshes only now. One object per semantic component/material.
for (part,mat,smooth),(verts,faces) in meshes.items():
 mesh=bpy.data.meshes.new(part+'_'+mat);mesh.from_pydata(verts,[],faces);mesh.update()
 ob=bpy.data.objects.new(part+'__'+mat,mesh);bpy.context.collection.objects.link(ob);mesh.materials.append(M[mat]);ob['asset']=True;ob['component']=part
 for poly in mesh.polygons:poly.use_smooth=smooth
 # Recalculate winding coherently for prisms and procedural rods.
 bpy.context.view_layer.objects.active=ob;ob.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)

# Named non-rendered anchors remain portable in the GLB.
for name,loc in [('entree-4bis',(-20,1.35,.3)),('entree-4',(9,1.35,.3)),('parking-bas',(-31.15,-.35,2.3)),('parking-haut',(-25.7,1.5,2.3))]:
 ob=bpy.data.objects.new(name,None);ob.location=B(loc);ob['asset']=True;ob['landmark']=name;bpy.context.collection.objects.link(ob)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene['reference']=json.dumps(json.loads((ROOT/'model/reference.json').read_text()),ensure_ascii=False)
scene['provenance']='Seven user-supplied street/aerial views, 7 October 2026. Photo-derived estimates; not a survey.'
scene['entrances']='4 bis: left by parking. 4: right when seen from street.'

# Neutral studio light and photographic review cameras, not included in the web asset.
world=bpy.data.worlds.new('Lumiere_du_jour');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.75,.79,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.65
def area(name,loc,power,size,target):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=B(loc);ob.rotation_euler=(Vector(B(target))-ob.location).to_track_quat('-Z','Y').to_euler()
area('Grande lumiere',(-28,45,30),6500,24,(-3,6,0));area('Reflet ciel',(24,25,15),2500,30,(0,7,-2))
sun_data=bpy.data.lights.new('Soleil','SUN');sun_data.energy=2.0;sun_data.angle=.12
sun=bpy.data.objects.new('Soleil',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(.55,-.45,-.35)
def camera(name,loc,target,scale):
 data=bpy.data.cameras.new(name);data.type='ORTHO';data.ortho_scale=scale
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=B(loc);ob.rotation_euler=(Vector(B(target))-ob.location).to_track_quat('-Z','Y').to_euler();return ob
cameras=[camera('Perspective_rue',(-43,25,64),(-5.4,7.3,-.5),68),camera('Elevation_rue',(0,9,80),(-3,9,0),68),camera('Parkings_detail',(-44,13,26),(-25.6,3.4,1),28),camera('Toiture',(-36,78,45),(-3.5,0,-2),69)]
scene.camera=cameras[0];scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1800;scene.render.resolution_y=1125;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
# Save a fully editable native model and embed its reproducible authoring source.
bpy.data.texts.load(str(Path(__file__).resolve()))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Villa-Colbert.blend'))
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
 if ob.get('asset'):ob.select_set(True)
export_opts=dict(export_format='GLB',use_selection=True,export_extras=True,export_yup=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_normals=True,export_texcoords=False)
bpy.ops.export_scene.gltf(filepath=str(OUT/'Villa-Colbert.glb'),**export_opts)
# Web-only batching. The saved .blend and portable GLB keep editable components.
for ob in list(scene.objects):
 if ob.type=='FONT':
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
groups=defaultdict(list)
for ob in scene.objects:
 if ob.type=='MESH' and ob.get('asset'):groups[ob.data.materials[0].name].append(ob)
for name,objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for ob in objects:ob.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 if len(objects)>1:bpy.ops.object.join()
 objects[0].name='Web_'+name
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
 if ob.get('asset'):ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(WEB/'villa-colbert.glb'),export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=16,export_draco_normal_quantization=10,**export_opts)
for ob in scene.objects:
 if ob.type=='MESH':ob.data.calc_loop_triangles()
metadata={'revision':'2026-10-07','counts':dict(counts),'balconyEvidence':{'streetAndLeft':30,'rearEstimated':20},'objects':len([o for o in scene.objects if o.get('asset')]),'triangles':sum(len(o.data.loop_triangles) for o in scene.objects if o.type=='MESH'),'webBytes':(WEB/'villa-colbert.glb').stat().st_size,'masterBytes':(OUT/'Villa-Colbert.glb').stat().st_size,'units':'photo-estimated metres, not surveyed','landmarks':{'4bis':[-20,1.35,.3],'4':[9,1.35,.3],'parkingBas':[-31.15,-.35,2.3],'parkingHaut':[-25.7,1.5,2.3]}}
(WEB/'villa-colbert.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n');(OUT/'model-info.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print('MODEL_STATS',json.dumps(metadata),flush=True)
for cam in cameras:
 scene.camera=cam;scene.render.filepath=str(OUT/(cam.name+'.png'));bpy.ops.render.render(write_still=True)
