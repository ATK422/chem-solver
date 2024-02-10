const atomicMasses: { [key: string]: number } = {
	H: 1.01,
	He: 4.0,
	Li: 6.94,
	Be: 9.01,
	B: 10.81,
	C: 12.01,
	N: 14.01,
	O: 16.0,
	F: 19.0,
	Ne: 20.18,
	Na: 22.99,
	Mg: 24.31,
	Al: 26.98,
	Si: 28.09,
	P: 30.97,
	S: 32.06,
	Cl: 35.45,
	Ar: 39.95,
	K: 39.1,
	Ca: 40.08,
	Sc: 44.96,
	Ti: 47.87,
	V: 50.94,
	Cr: 52.0,
	Mn: 54.94,
	Fe: 55.85,
	Co: 58.93,
	Ni: 58.69,
	Cu: 63.55,
	Zn: 65.38,
	Ga: 69.72,
	Ge: 72.63,
	As: 74.92,
	Se: 78.96,
	Br: 79.9,
	Kr: 83.8,
	Rb: 85.47,
	Sr: 87.62,
	Y: 88.91,
	Zr: 91.22,
	Nb: 92.91,
	Mo: 95.94,
	Tc: 98.0,
	Ru: 101.07,
	Rh: 102.91,
	Pd: 106.42,
	Ag: 107.87,
	Cd: 112.41,
	In: 114.82,
	Sn: 118.71,
	Sb: 121.76,
	Te: 127.6,
	I: 126.9,
	Xe: 131.29,
	Cs: 132.91,
	Ba: 137.33,
	//Skip Lanthanides
	Lu: 174.97,
	Hf: 178.49,
	Ta: 180.95,
	W: 183.84,
	Re: 186.21,
	Os: 190.23,
	Ir: 192.22,
	Pt: 195.08,
	Au: 196.97,
	Hg: 200.59,
	Tl: 204.38,
	Pb: 207.2,
	Bi: 208.98,
	Po: 209.0,
	At: 210.0,
	Rn: 222.0,
	Fr: 223.0,
	Ra: 226.0
	//Skip Actinides
};

function isLetter(char: string): boolean {
	return /[a-zA-Z]/.test(char);
}

function isUppercase(char: string): boolean {
	return /[A-Z]/.test(char);
}

function isNumber(char: string): boolean {
	return /\d/.test(char);
}

export function getAtomicMassFromString(equation: string): number {
    let mass = 0;
    let element = '';
    let quantity = '';
    let coefficient = '';

    for (let i = 0; i < equation.length; i++) {
        const char = equation[i];

        if (isNumber(char) && i === 0) {
            // We're reading the coefficient at the start of the equation
            coefficient += char;
        } else if (isLetter(char)) {
            if (isUppercase(char) && element) {
                // We've started a new element, so add the mass of the previous one to the total
                mass += atomicMasses[element] * (quantity ? parseInt(quantity) : 1) * (coefficient ? parseInt(coefficient) : 1);
                element = char;
                quantity = '';
                coefficient = '';
            } else {
                // We're still reading the same element
                element += char;
            }
        } else if (isNumber(char)) {
            // Continue reading the quantity
            quantity += char;
        }
    }

    // Add the mass of the last element
    if (element) {
        mass += atomicMasses[element] * (quantity ? parseInt(quantity) : 1) * (coefficient ? parseInt(coefficient) : 1);
    }

    return mass;
}

export function compoundAsHTML(compound: string): string {
	return compound.replace(/(\w|\))(\d)/g, (_, letter, number) => `${letter}<sub>${number}</sub>`);
}