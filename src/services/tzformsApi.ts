import Target from '~types/Target';

export type CompileResponse = { [target: string]: string | Error } | Error;

const tzformsApi = {
    compile: async (code: string, targets?: Target[]): Promise<CompileResponse> => {
        try {
            const endpoint = new URL(`/compile${targets ? '?t=' + targets.join(',') : ''}`, TZFORMS_API_URL).toString();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code
                })
            });
            if (response.ok) {
                const data: { target: string, result: string | Error } = await response.json();
                return data;
            } else {
                const error = await response.text();
                return new Error(error);
            }
        } catch(e) {
            if (e instanceof Error) return e;
            else if (typeof e === 'string') return new Error(e);
            else return new Error('An unexpected error occurred.');
        }
    }
}

export default tzformsApi;