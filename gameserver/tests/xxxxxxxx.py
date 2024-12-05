
from gameserver.game.ds.graph import Graph
from gameserver.game.rect import Rectangle, RectangleBuilder
from gameserver.game.vector import Vector

g = Graph(dimension=20)
g.init_graph()


rectangle = RectangleBuilder(Vector(0, 0), Vector(5, 5)).build()
g[10][8] = 100

map_size = 6

rec = RectangleBuilder(Vector(0, 0), Vector(map_size-1, map_size-1)).build()
for x, y in rec:
    print(x, y)