# Web interface – Other inputs

The web app has five inputs.

The first is a large text area. This is where your phonology definition goes
(see [The Phonology Definition](./grammar.md)).

The second is a textbox to enter a number. If you leave it blank or put `0`,
Lexifer will generate a fake paragraph. If you enter a positive number, it will
attempt to generate that many words. If you put too large of a number, or if
the phonology definition leaves a small number of legal words, it may not be
able to generate the requested amount. Note that it will still try to, and so
entering too large of a number will result in slowdowns. This shouldn't be an
issue for reasonable cases, however.

Below that are three checkboxes. They only matter if you enter a positive
number for the number of words.

The first one is labelled "leave output unsorted". By default, Lexifer will
alphabetize the wordlist. Check this box to disable that, instead outputting
the words in a random order.

The second one is labelled "display only one word per line". By default,
Lexifer will display multiple words on each line, similarly to in paragraph
mode. What this option does is pretty self-explanatory.

The third one is labelled "display all generation steps". This option exists
primarily for debugging. It shows you how exactly Lexifer got to the words it
generated. In this mode, the output is always unsorted, and the one word per
line option is ignored. I recommend using a smaller number of words for this,
or else the output gets quite long. With the default phonology definition, an
example output might look like:

> V?CVD?CVD?CVD? – chánanbi  
> std-assimilations – chánambi
> 
> V?CVD?CVD?CVD? – nininu  
> (..+)\1+ > REJECT – REJECT

The more filters you have, the longer the output tends to be.
