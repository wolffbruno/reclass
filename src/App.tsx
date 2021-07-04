import React, {ChangeEvent, useState} from 'react';

class OrderedPair {
    x: any;
    y: any;

    constructor(x = '', y = '') {
        this.x = x;
        this.y = y;
    }
}

class Relation {
    pairs: OrderedPair[] = [];

    transitivePairs(): [OrderedPair | null, OrderedPair | null][] {
        const result: [OrderedPair | null, OrderedPair | null][] = [];
        this.pairs
            .filter(pair => this.pairs.find(t => t.x === pair.y))
            .forEach(transitivePair => {
                const transitivities = this.pairs.filter(t => t.x === transitivePair.y);

                transitivities.forEach(transitivity => result.push([transitivePair, transitivity]));
            });

        return result;
    }

    simetricPairs(): [OrderedPair | null, OrderedPair | null][]  {
        return this.pairs.filter(pair => this.pairs.find(x => x.x === pair.y && x.y === pair.x)).map(pair => [pair, this.pairs.find(x => x.x === pair.y && x.y === pair.x) as OrderedPair])
    }

    get isSimetric(): boolean {
        if (this.simetricPairs() && this.simetricPairs().length > 0) {
            const cond = (x: [OrderedPair | null, OrderedPair | null]) => x[0]?.x === x[1]?.x && x[0]?.y === x[1]?.y;
            const count = this.simetricPairs().filter(pair => !cond(pair)).length + this.pairs.filter(pair => pair.x === pair.y).length;

            return count === this.pairs.length;
        } else {
            return false;
        }
    }

    get isTransitive(): boolean {
        return this.transitivePairs() && this.transitivePairs().length > 0 && this.transitivePairs().every(t => this.pairs.find(x => x.x === t[0]?.x && x.y === t[1]?.y))
    }

    get invertedRelation(): OrderedPair[] {
        return this.pairs.map(x => new OrderedPair(x.y, x.x));
    }

    get isAntiSimetric(): boolean {
        return this.simetricPairs().every((pair: [OrderedPair | null, OrderedPair | null]) => pair[0]?.x === pair[1]?.x && pair[0]?.y === pair[1]?.y);
    }
}

function App() {
    const [relation] = useState(new Relation());
    const [orderedPair, setOrderedPair] = useState(new OrderedPair());

    const addOrderedPair = () => {
        if (orderedPair.x && orderedPair.y) {
            relation.pairs.push(orderedPair);
            setOrderedPair(new OrderedPair());
        }
    }

    function changeX(e: ChangeEvent<HTMLInputElement>) {
        const copy = new OrderedPair(e.target.value, orderedPair.y);
        setOrderedPair(copy);
    }

    function changeY(e: ChangeEvent<HTMLInputElement>) {
        const copy = new OrderedPair(orderedPair.x, e.target.value);
        setOrderedPair(copy);
    }


    return (
        <>
            <div className="w-full p-10 flex flex-col gap-y-6 items-start">
                <div>
                    <h1 className="text-lg font-bold">ReClass</h1>
                    <span>Classificador de relações</span>
                </div>
                <div className="bg-gray-50 ring-2 rounded-sm ring-gray-200 px-4 py-2 text-gray-300 flex gap-4 flex-wrap">
                    <span>(</span>
                    <input type="text" value={orderedPair.x} onChange={(e) => changeX(e)} className="w-10"
                           placeholder="x"/>
                    <span>,</span>
                    <input type="text" value={orderedPair.y} onChange={(e) => changeY(e)} className="w-10"
                           placeholder="y"/>
                    <span>)</span>
                    <button onClick={() => addOrderedPair()}
                            className="bg-green-500 rounded-full text-blue-50 px-4 text-sm py-1 hover:bg-green-600 transition-colors">
                        Adicionar
                    </button>
                </div>
                <div>
                    Pontos
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {
                            relation.pairs.map((pair, i) => {
                                return (
                                    <div className="ordered-pair" key={i}>
                                        ({pair.x}, {pair.y})
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div>
                    Pontos invertidos (R<sup>-1</sup>)
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {
                            relation.invertedRelation.map((pair, i) => {
                                return (
                                    <div className="ordered-pair" key={i}>
                                        ({pair.x}, {pair.y})
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div>
                    Classificação
                    {
                        relation && relation.pairs && relation.pairs.length > 0 && (
                            <div className="flex flex-col gap-4 text-gray-400">
                                {relation.isSimetric && <span>Simétrica</span>}
                                {relation.isTransitive && <span>Transitiva</span>}
                                {relation.isAntiSimetric && <span>Anti-simétrica</span>}
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default App;
