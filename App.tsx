import { Stage, Layer, Circle, Line, Rect, Arrow } from 'react-konva';
import { useState, useRef } from 'react';

const FIELD_WIDTH = 900;
const FIELD_HEIGHT = 1300;
const PLAYER_RADIUS = 15;
const LINE_OF_SCRIMMAGE = 600;


type Point = {x: number; y: number};

type ArrowData = {
    id: number;
    start: Point;
    rest: Point[];
};
type Zone = {
    x: number;
    y: number;
    radius: number;
}
type Player = {
    id: number;
    x: number;
    y: number;
    initialX: number;
    initialY: number;
    role: string;
    color: string;
    path: Point[];
    originalPath: Point[],
    zone?: Zone,
    isDefense: boolean,
    resizing?: boolean,
};

function App() {
    var resetValid = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [players, setPlayers] = useState<Player[]>([
        {id: 1, x: 390, y: 600, role: 'qb', color: "red", path: [{ x: 390, y: 600 },  { x: 600, y: 700 }], isDefense: false},
        {id: 2, x: 420, y: 600, role: 'wr', color: "red", path: [{ x: 420, y: 600 },  { x: 600, y: 700 }], isDefense: false},
        {id: 3, x: 450, y: 600, role: 'de', color: "red", path: [{ x: 450, y: 600 },  { x: 600, y: 700 }], isDefense: false},
        {id: 4, x: 480, y: 600, role: 'qb', color: "red", path: [{ x: 480, y: 600 },  { x: 600, y: 700 }], isDefense: false},
        {id: 5, x: 510, y: 600, role: 'wr', color: "red", path: [{ x: 510, y: 600 }, { x: 600, y: 700 }], isDefense: false},
        {id: 6, x: 450, y: 700, role: 'de', color: "red", path: [{ x: 450, y: 700 },  { x: 600, y: 700 }], isDefense: false},
        {id: 7, x: 510, y: 630, role: 'qb', color: "red", path: [{ x: 510, y: 630 },  { x: 600, y: 700 }], isDefense: false},
        {id: 8, x: 390, y: 630, role: 'wr', color: "red", path: [{ x: 390, y: 630 },  { x: 600, y: 700 }], isDefense: false},
        {id: 9, x: 420, y: 700, role: 'de', color: "red", path: [{ x: 420, y: 700 }, { x: 600, y: 700 }], isDefense: false},
        {id: 10, x: 480, y: 700, role: 'qb', color: "red", path: [{x: 480, y: 700 },  { x: 600, y: 700 }], isDefense: false},
        {id: 11, x: 700, y: 600, role: 'wr', color: "red", path: [{x: 700, y: 600 },  { x: 600, y: 700 }], isDefense: false},
        {id: 12, x: 450, y: 570, role: 'dl', color: "blue", path: [{x: 450, y: 570}, {x: 600, y: 700}], isDefense: true},
        {id: 13, x: 390, y: 570, role: 'dl', color: "blue", path: [{x: 390, y: 570}, {x: 600, y: 700}], isDefense: true},
        {id: 14, x: 510, y: 570, role: 'dl', color: "blue", path: [{x: 510, y: 570}, {x: 600, y: 700}], isDefense: true},
        {id: 15, x: 480, y: 500, role: 'dl', color: "blue", path: [{x: 480, y: 500}, {x: 600, y: 700}], isDefense: true},
        {id: 16, x: 420, y: 500, role: 'dl', color: "blue", path: [{x: 420, y: 500}, {x: 600, y: 700}], isDefense: true},
        {id: 17, x: 360, y: 500, role: 'dl', color: "blue", path: [{x: 360, y: 500}, {x: 600, y: 700}], isDefense: true},
        {id: 18, x: 540, y: 500, role: 'dl', color: "blue", path: [{x: 540, y: 500}, {x: 600, y: 700}], isDefense: true},
        {id: 19, x: 200, y: 200, role: 'dl', color: "blue", path: [{x: 200, y: 200}, {x: 600, y: 700}], isDefense: true},
        {id: 20, x: 700, y: 200, role: 'dl', color: "blue", path: [{x: 700, y: 200}, {x: 600, y: 700}], isDefense: true},
        {id: 21, x: 700, y: 570, role: 'dl', color: "blue", path: [{x: 700, y: 570}, {x: 600, y: 700}], isDefense: true},
        {id: 22, x: 200, y: 570, role: 'dl', color: "blue", path: [{x: 200, y: 570}, {x: 600, y: 700}], isDefense: true},

        ]);

    const handleDragMove = (id: number, x: number, y: number) => {
        setPlayers((prev) =>
        prev.map((p) =>
         p.id === id
         ? {
             ...p,
             x,
             y,
             path: [{x,y}, ...p.path.slice(1)],
             }
         :p
         )
     );
    };

    const movePlayers = () => {
      resetValid.current = true;
      console.log("movePlayers function called");

      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          initialX: p.x,
          initialY: p.y,
          originalPath: [...p.path],
        }))
      );

      let step = 1;
      const totalSteps = 300;

      intervalRef.current = setInterval(() => {
        setPlayers((prev) =>
          prev.map((p) => {
            const path = [...p.path];
            if (path.length < 2) return p;

            const [_, next] = path;
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Speed can be adjusted here
            const speed = 5;
            const ratio = speed / distance;

            const newX = p.x + dx * ratio;
            const newY = p.y + dy * ratio;

            // If close enough, move to next segment
            if (distance < 5) {
              const updatedPath = path.slice(1);
              return { ...p, x: next.x, y: next.y, path: updatedPath };
            }

            return { ...p, x: newX, y: newY };
          })
        );

        step++;
        if (step > totalSteps && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
           }
      }, 30);
    };

    const resetPlayers = () => {
        if (resetValid.current){
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setPlayers((prev) =>
            prev.map((p) => ({
                ...p,
                x: p.initialX,
                y: p.initialY,
                path: [...p.originalPath],
                }))
            );
        }
    resetValid.current = false;
    console.log(players);
    };



    return (
        <div className = "App"
        style= {{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'}}
            >
        <button onClick={movePlayers}> Move Players </button>
        <button onClick={resetPlayers}> Reset Players </button>
            <Stage width = {FIELD_WIDTH}
            height = {FIELD_HEIGHT}
            style = {{border: '2px solid black'}}
            >
                <Layer>
                {/* Field background */}
                    <Rect
                        width = {FIELD_WIDTH}
                        height = {FIELD_HEIGHT}
                        fill = "#1e7f1e"
                        stroke = "white"
                        strokeWidth = {4}
                        />
                        {/* Yard lines */}
                        {[...Array(4)].map((_, i) => (
                            <Line
                            key={i}
                            points={[300 * i, 0, 300 * i, FIELD_HEIGHT]}
                            stroke = "white"
                            strokeWidth = {2}
                            dash={[10,20]}
                            />
                            ))}
                        <Line
                            points={[0, LINE_OF_SCRIMMAGE, FIELD_WIDTH, LINE_OF_SCRIMMAGE]}
                            stroke="red"
                            strokeWidth={4}
                            dash={[10, 10]}
                          />
                          {[...Array(4)].map((_, i) => (
                              <Line
                              key={i}
                              points = {[0, 300 * i, FIELD_WIDTH, 300*i]}
                              stroke= "white"
                              strokeWidth = {2}
                              />
                              ))}
                          {/* Arrows */}
                          {players.map((player) =>
                              player.path.length > 1 ? (
                                  <Arrow
                                  key={`arrow-${player.id}`}
                                  points={player.path.flatMap((pt) => [pt.x, pt.y])}
                                  pointerLength ={10}
                                  pointerWidth={10}
                                  fill="white"
                                  stroke = "white"
                                  strokeWidth={2}
                                  onMouseDown={(e) => {
                                      const stage = e.target.getStage();
                                      const pointerPos = stage?.getPointerPosition();
                                      if (!pointerPos) return;

                                      setPlayers((prev) =>
                                        prev.map((p) => {
                                            if (p.id !== player.id) return p;
                                            const path = [...p.path];
                                            path.push(pointerPos);
                                            return {
                                                ...p,
                                                path,
                                            };
                                        })
                                    );
                                }}
                            />
                           ) : null
                       )}
                        {/* draggable handles for intermidiate points */}
                        {players.map((player) =>
                          player.path.map((pt, i) => {
                            if (i === 0) return null; // skip the start and end points
                            return (
                              <Circle
                                key={`handle-${player.id}-${i}`}
                                x={pt.x}
                                y={pt.y}
                                radius={6}
                                fill="orange"
                                stroke="black"
                                strokeWidth={1}
                                draggable
                                onDragMove={(e) => {
                                  console.log("dragging arrow registered", e.target.x(), e.target.y());
                                  const newX = e.target.x();
                                  const newY = e.target.y();

                                  setPlayers((prev) =>
                                    prev.map((p) => {
                                      if (p.id !== player.id) return p;

                                      const newPath = [...p.path];
                                      newPath[i] = { x: newX, y: newY };
                                      return { ...p, path: newPath };
                                    })
                                  );
                                }}
                              />
                            );
                          })
                        )}

                        {/* Players */}
                        {players.map((player) => (
                            <Circle
                              key={player.id}
                              x={player.x}
                              y={player.y}
                              radius={15}
                              fill= {player.isDefense ? 'blue' : 'red'}
                              stroke="black"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) => {
                                  const newX = e.target.x();
                                  const newY = e.target.y();
                                  console.log(`Dragging player ${player.id} to`, newX, newY);
                                  handleDragMove(player.id, newX, newY);
                                  }}
                              onClick={() => {
                                if (isAddingZone && player.isDefense) {
                                  setPlayers((prev) =>
                                    prev.map((p) =>
                                      p.id === player.id
                                        ? {
                                            ...p,
                                            zone: {
                                              x: p.x + 30, // offset to right of player
                                              y: p.y,
                                              radius: 40,
                                            },
                                          }
                                        : p
                                    )
                                  );
                                  setIsAddingZone(false); // reset mode
                                }
                              }}
                            />
                            ))}

                    </Layer>
                </Stage>
            </div>
        );

}

export default App;

