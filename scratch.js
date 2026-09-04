const fs = require('fs');
const tsCode = fs.readFileSync('src/app/component/student-portel/std-resources/std-resources.component.ts', 'utf8');

// We need to extract the resources array.
// It starts with 'resources: ResourceItem[] = ['
const startIndex = tsCode.indexOf('resources: ResourceItem[] = [');
const endIndex = tsCode.lastIndexOf('];');

if (startIndex > -1 && endIndex > -1) {
    let arrayString = tsCode.substring(startIndex + 'resources: ResourceItem[] = '.length, endIndex + 1);

    // We want to remove 'this.sanitizer.bypassSecurityTrustHtml(' and ')' 
    arrayString = arrayString.replace(/this\.sanitizer\.bypassSecurityTrustHtml\(/g, '');
    arrayString = arrayString.replace(/\)(?=\s*,)/g, ''); // Naive replace closing parenthesis before comma

    // It's still not valid JSON because of unquoted keys and single quotes, and backticks.
    // It might be easier to just evaluate it.

    // A quick hack to evaluate the array:
    let codeToRun = 
    const thisObj = { sanitizer: { bypassSecurityTrustHtml: val => val } };
    const resources = + arrayString + ;
    console.log(JSON.stringify(resources, null, 2));
    ;

    try {
        const val = eval(arrayString);
        fs.writeFileSync('src/assets/data/resources.json', JSON.stringify(val, null, 2));
        console.log('Successfully wrote to src/assets/data/resources.json');
    } catch (e) {
        console.log('Error evaluating array:', e.message);
    }
} else {
    console.log('Could not find resources array');
}
