import React, {ChangeEvent, useState, useRef} from 'react';

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
    endoRelation: string[] = [];

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

    get isReflexive(): boolean {
        return this.endoRelation && this.endoRelation.length > 0 && this.endoRelation.every(e => this.pairs.find(pair => pair.x === e && pair.y === e));
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

    get composition(): OrderedPair[] {
      return this.transitivePairs().map(t => new OrderedPair(t[0]?.x, t[1]?.y));
    }
}

function useForceUpdate(){
    // @ts-ignore
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

function App() {
    const [relation] = useState(new Relation());
    const forceUpdate = useForceUpdate();
    const [inputValue, setInputValue] = useState('');
    const [inputPairsValue, setInputPairsValue] = useState('');
    const [orderedPair, setOrderedPair] = useState(new OrderedPair());
    const xInput = useRef<HTMLInputElement>(null);

    function addOrderedPair(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (orderedPair.x && orderedPair.y) {
            relation.pairs.push(orderedPair);
            setOrderedPair(new OrderedPair());
        }

        if (xInput.current) {
            xInput.current.focus();
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

    function handleSetChange(e: ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
        const array = (e.target.value || '').split(',').map(x => x.trim());

        relation.endoRelation = array.filter(x => x);
        console.log(relation.endoRelation)
    }

    function handlePairsChange(e: ChangeEvent<HTMLInputElement>) {
        const regex = /\(.*?\)/gi;
        setInputPairsValue(e.target.value)

        const r = e.target.value.matchAll(regex);
        relation.pairs = [];

        Array.from(r).forEach((e) => {
            const t = e[0].replace(/[()]/gi, '').split(',').map(x => x.trim());
            relation.pairs.push(new OrderedPair(t[0], t[1]));
        })
    }

    function removePair(i: number) {
        relation.pairs.splice(i, 1);
        forceUpdate();
    }

    function cartesianProduct() {
        if (relation.endoRelation && relation.endoRelation.length > 0) {
            relation.endoRelation.forEach(end => {
                relation.endoRelation.forEach(endd => {
                    relation.pairs.push(new OrderedPair(end, endd));
                });
            });
            forceUpdate();
        }
    }

    return (
        <>
            <div className="w-full p-10 flex flex-col gap-y-6 items-start">
                <div>
                    <h1 className="text-lg font-bold">ReClass</h1>
                    <span className="text-gray-600">Classificador de relações</span>
                </div>
                <div className="flex flex-col ring-1 ring-gray-200 rounded-sm p-4 items-start">
                    Conjunto endorrelacionado (separe os elementos por vírgulas)
                    <input value={inputValue} onChange={(e) => handleSetChange(e)} className="p-2 bg-gray-100 text-left mt-1" type="text" placeholder="Elementos"/>
                    <div className="mt-2 flex gap-4 flex-wrap items-center">
                        {'{'}{
                            relation.endoRelation.map((e, i) => {
                                return (
                                    <div className="ordered-pair" key={i}>
                                        {e}
                                    </div>
                                )
                            })
                        }{'}'}
                    </div>
                    <button onClick={() => cartesianProduct()}
                            className="bg-blue-500 rounded-full mt-2 text-blue-50 px-4 text-sm py-1 hover:bg-blue-600 transition-colors">
                        Montar produto cartesiano
                    </button>
                </div>
                <div className="ring-1 ring-gray-200 rounded-sm p-4 flex flex-col items-start">
                    Pares
                    <input value={inputPairsValue} onChange={(e) => handlePairsChange(e)} className="p-2 bg-gray-100 text-left mt-1" type="text" placeholder="Pares"/>
                    <form onSubmit={(e) => addOrderedPair(e)} className="mt-2 bg-gray-50 ring-2 rounded-sm ring-gray-200 px-4 py-2 text-gray-300 flex gap-4 flex-wrap">
                        <span>(</span>
                        <input ref={xInput} type="text" value={orderedPair.x} onChange={(e) => changeX(e)} className="w-10"
                               placeholder="x"/>
                        <span>,</span>
                        <input type="text" value={orderedPair.y} onChange={(e) => changeY(e)} className="w-10"
                               placeholder="y"/>
                        <span>)</span>
                        <button type="submit"
                                className="bg-green-500 rounded-full text-blue-50 px-4 text-sm py-1 hover:bg-green-600 transition-colors">
                            Adicionar par
                        </button>
                    </form>
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {
                            relation.pairs.map((pair, i) => {
                                return (
                                    <div className="ordered-pair" onClick={() => removePair(i)} key={i}>
                                        ({pair.x}, {pair.y})
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="ring-1 ring-gray-200 rounded-sm p-4">
                    Pares invertidos (R<sup>-1</sup>)
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
                <div className="ring-1 ring-gray-200 rounded-sm p-4">
                    Pares de composição (R◦R)
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {
                            relation.composition.map((pair, i) => {
                                return (
                                    <div className="ordered-pair" key={i}>
                                        ({pair.x}, {pair.y})
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="ring-1 ring-gray-200 rounded-sm p-4">
                    Classificação
                    {
                        relation && relation.pairs && relation.pairs.length > 0 && (
                            <div className="flex flex-col gap-4 text-gray-400 ml-10">
                                <ol className="list-disc">
                                    {relation.isReflexive && <li>Reflexiva</li>}
                                    {relation.isSimetric && <li>Simétrica</li>}
                                    {relation.isTransitive && <li>Transitiva</li>}
                                    {relation.isAntiSimetric && <li>Anti-simétrica</li>}
                                </ol>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default App;
