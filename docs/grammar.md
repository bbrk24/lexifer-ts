# The Phonology Definition

## Table of Contents

> - [Overview](#overview)
> - [Comments](#comments)
> - [Options – the `with:` directive](#options--the-with-directive)
>     - [Featuresets](#featuresets)
>     - [Engines](#engines)
>         - [`std-assimilations`](#std-assimilations)
>         - [`coronal-metathesis`](#coronal-metathesis)
> - [Alphabetization – the `letters:`
> directive](#alphabetization--the-letters-directive)
> - [Describing words](#describing-words)
>     - [Phoneme classes](#phoneme-classes)
>     - [Building word shapes](#building-word-shapes)
>     - [Macros](#macros)
>     - [Categories](#categories)
> - [Filters and Rejections](#filters-and-rejections)
> - [Cluster Fields](#cluster-fields)

## Overview

The phonology definition is the main input to the wordgen. In the command-line
version, these are saved as `.def` files; I may still refer to them as def
files, even though in most cases they aren't.

## Comments

If a line contains a `#` sign, everything after the `#` on that line is
ignored. You can use this to leave notes about what the def file does or why
you made certain decisions.

## Options – the `with:` directive

The first line of the default definition starts with `with:`. If you have such
a directive, it should be at the start of the file.

### Featuresets

By default, if you have a `with:` directive, the IPA featureset is used. It is
possible to opt-in to ASCII digraphs by adding the `std-digraph-features`
option, but this is discouraged and will be removed in the future.

Currently recognized consonants are:

| IPA | Digraph | Features                             |
|:---:|:-------:|:-------------------------------------|
|  p  |    p    | voiceless bilabial plosive           |
|  b  |    b    | voiced bilabial plosive              |
|  ɸ  |   ph    | voiceless bilabial fricative         |
|  β  |   bh    | voiced bilabial fricative            |
|  f  |    f    | voiceless labiodental fricative      |
|  v  |    v    | voiced labiodental fricative         |
|  m  |    m    | voiced labial¹ nasal                 |
|  t  |    t    | voiceless alveolar plosive           |
|  d  |    d    | voiced alveolar plosive              |
|  s  |    s    | voiceless alveolar sibilant          |
|  z  |    z    | voiced alveolar sibilant             |
|  θ  |   th    | voiceless alveolar² fricative        |
|  ð  |   dh    | voiced alveolar² fricative           |
|  ɬ  |   lh    | voiceless alveolar lateral fricative |
|  ɮ  |   ldh   | voiced alveolar lateral fricative    |
| tɬ  |   tl    | voiceless alveolar lateral affricate |
| dɮ  |   dl    | voiced alveolar lateral affricate    |
| ts  |   ts    | voiceless alveolar affricate         |
| dz  |   dz    | voiced alveolar affricate            |
|  ʃ  |   sh    | voiceless postalveolar sibilant      |
|  ʒ  |   zh    | voiced postalveolar sibilant         |
| tʃ  |   ch    | voiceless postalveolar affricate     |
| dʒ  |    j    | voiced postalveolar affricate        |
|  n  |    n    | voiced alveolar nasal                |
|  ʈ  |   rt    | voiceless retroflex plosive          |
|  ɖ  |   rd    | voiced retroflex plosive             |
|  ʂ  |   sr    | voiceless retroflex sibilant         |
|  ʐ  |   zr    | voiced retroflex sibilant            |
| ʈʂ  |   rts   | voiceless retroflex affricate        |
| ɖʐ  |   rdz   | voiced retroflex affricate           |
|  ɳ  |   rn    | voiced retroflex nasal               |
|  c  |   ky    | voiceless palatal plosive            |
|  ɟ  |   gy    | voiced palatal plosive               |
|  ɕ  |   sy    | voiceless palatal sibilant           |
|  ʑ  |   zy    | voiced palatal sibilant              |
|  ç  |   hy    | voiceless palatal fricative          |
|  ʝ  |   yy    | voiced palatal fricative             |
| tɕ  |   cy    | voiceless palatal affricate          |
| dʑ  |   jy    | voiced palatal affricate             |
|  ɲ  |   ny    | voiced palatal nasal                 |
|  k  |    k    | voiceless velar plosive              |
|  g  |    g    | voiced velar plosive                 |
|  x  |   kh    | voiceless velar fricative            |
|  ɣ  |   gh    | voiced velar fricative               |
|  ŋ  |   ng    | voiced velar nasal                   |
|  q  |    q    | voiceless uvular plosive             |
|  ɢ  |   gq    | voiced uvular plosive                |
|  χ  |   qh    | voiceless uvular fricative           |
|  ʁ  |   gqh   | voiced uvular fricative              |
|  ɴ  |   nq    | voiced uvular nasal                  |

<!--
    I know that in some Markdown engines, a superscript can be represented with
    ^. However, that doesn't seem universal, so I opted for Unicode
    superscripts instead.
-->

¹These are both bilabial and labiodental. For example, the assimilations engine
turns `nf` into *mf* and `nɸ` into *mɸ*, even though `f` and `ɸ` have different
places of articulation.  
²Yes, I realize that the IPA describes these as dental. However, the IPA does
not make the dental/alveolar distinction elsewhere, so it is simpler to say
that these are alveolar.

Choosing a specific featureset does not mean you have to use it for everything.
Rather, you only need to use it for the consonants that will be considered by
the engines you use (see below). Any unrecognized segments will be ignored. Note
that no approximants or trills are currently recognized.

### Engines

Without an engine, there is no real purpose in having a `with:` directive.
There are two engines present in Lexifer: `std-assimilations` and
`coronal-metathesis`.

#### `std-assimilations`

This engine has two behaviors.

The first affects all consonants for which both voiced and voiceless versions
exist. It applies leftward assimilation of voicing. For example, it would turn
`akda` into *agda* and `abta` into *apta*.

The second only changes nasals, but considers all recongized consonants. It
applies leftward assimilation of place of articulation. For example, it would
turn `amta` into *anta* and `anka` into *aŋka*.

#### `coronal-metathesis`

This engine only affects bilabial, alveolar, and velar plosives and nasals. It
ensures that clusters of these segments have the alveolar element last. For
example, it would turn `atka` into *akta* and `anma` into *amna*. It does not
metathesize a nasal with a plosive; `anpa` would not become *apna*.

## Alphabetization – the `letters:` directive

If you have a `with:` directive, there must also be `letters:`. If not,
`letters:` is optional.

`letters:` tells Lexifer what symbols you use and how to alphabetize them.
It also affects how digraphs are parsed, even if `std-ipa-features` was chosen.
For example, consider the following statements:

```
with: std-ipa-features
letters: t ʃ
```

In this case, if `tʃ` occurs, it will not be treated as an affricate *tʃ*, but
as a plosive *t* followed by a sibilant *ʃ*. Additionally, words starting with
*t* will be sorted alphabetically above words starting with *ʃ*.  
Contrast this with the following statements:

```
with: std-ipa-features
letters: tʃ t ʃ
```

In this case, `tʃ` is treated as an affricate. Additionally, words starting
with *tʃ* will be sorted above words starting with *tt*, even though *t* by
itself comes before *ʃ*.

## Describing Words

This is the main purpose of the def file. There are many parts to this.

### Phoneme classes

These are groupings of phonemes that have one-letter names. For example, here
are the classes from the default definition:

```
C = t n k m ch l ʔ s r d h w b y p g
D = n l ʔ t k r p
V = a i e á u o
```

This creates three groupings. `C` is the group of all consonants, `V` is the
group of all vowels, and `D` is a group of some of the consonants. A class
cannot contain another class; this is not legal:

```
C = D m ch s d h w b y g
```

If you do this, and you have a `letters:` directive, Lexifer will warn you:

> A phoneme class contains 'D' missing from 'letters'. Strange word shapes are
> likely to result.

By default, the phonemes' frequencies decrease as they go to the right. In the
above example, when Lexifer needs to choose a `C`, it will choose `t` the most,
`n` the second-most, `k` the third-most, and so on. If you are not satisfied
with the frequencies, you can use a colon (`:`) to specify the weight for each
phoneme, like so:

```
V = a e i o u
# V has approximately the following probabilities:
# a: 43%, e: 26%, i: 17%, o: 10%, u: 4%
U = a:5 e:4 i:3 o:2 u:1
# U has approximately the following probabilities:
# a: 33%, e: 27%, i: 20%, o: 13%, u: 7%
```

Weights are relative, so `a:5 e:4 i:3 o:2 u:1` is the same as
`a:50 e:40 i:30 o:20 u:10`. Changing the order or weights of phonemes is a good
way to change the feel of the language without changing the phonotactics.

If you specify a weight for any phoneme in a class, you must specify the weight
for all of them. If you specify a weight of `0`, the phoneme will never be
selected.

### Building word shapes

The most common way to make a word is to use the `words:` directive. Words are
weighted similarly to how phonemes are weighted in classes.

A word can consist of indiviual phonemes, phoneme classes, or a mixture of
both.

Phonemes or classes that are optional can be indicated by a `?`. For example,
`words: CVD?` is similar to `words: CV CVD`, although the weights are quite
different. The `random-rate:` directive specifies how common these are. For
example, 

```
random-rate: 25
words: CVD?
```

is equivalent to

```
words: CV:75 CVD:25
```

The default random-rate is 10%.

If you choose from the same class twice in a row, you may put an `!` after the
second one, to indicate they must not be the same phoneme. For example, `CC`
may generate *tt*, but `CC!` never will.

### Macros

Macros are a system designed to provide an abbreviation for syllable shapes.
They are defined similarly to phoneme classes, but with several important
differences:

- Every macro's name must start with `$`. `S = s` is a phoneme class; `$S = s`
is a macro.
- Macros allow phoneme classes inside of them. `C = D` is not valid, but
`$C = D` works as expected.
- Macros do not support multiple possibilities. `$M = a b c` will not work the
way you may think.

The default definition has one macro:

```
$S = CVD?

words: V?$S$S V?$S V?$S$S$S
```

This is exactly equivalent to the following definition:

```
words: V?CVD?CVD? V?CVD? V?CVD?CVD?CVD?
```

However, since most syllables are `CVD?`, it is quicker to use a macro.

### Categories

The `categories:` directive is an alternative to `words:`. You may not include
both directives in the same definition.

`categories:` lets you define multiple types of words. The general syntax is:

```
categories: cat1 cat2 # ...etc
cat1 = # word shapes for cat1
cat2 = # word shapes for cat2
```

The categories themselves can also be weighted, but these weights only apply in
paragraph mode. If you give a number of words, that is the number of words
generated per category. This is where a weight of 0 could be helpful. If you
want to generate parts of a word when you enter a number, but only show
complete words in paragraph mode, you could have something like:

```
categories: root:0 prefix:0 suffix:0 full-word:1
# ...definitions of each category...
```

The order that the categories are declared is the order they are presented when
generating a specific number of words.

## Filters and Rejections

Filters are a way to change a word after it has been generated and run though
the cluster engines. If your spelling doesn't match up with a featureset
exactly, you can use filters to achieve this.

Filters are expressed as `filter: pattern > replacement`, and run in the order
they are encountered. For example, if you want to spell \[ŋ\] the same as
\[n\], you would say:

```
filter: ŋ > n
```

This will probably be common in files that use `std-assimilations`.

Multiple filters on one line are separated by semicolons:

```
filter: pattern1 > replacement1; pattern2 > replacement2
```

This does not mean that the two filters are run at the same time. It is
identical to:

```
filter: pattern1 > replacement1
filter: pattern2 > replacement2
```

If the replacement is `!`, the pattern is removed from the word, but the rest
of the word is left alone.

To outright forbid a sequence from occurring, use the `reject:` directive. The
default definition contains a few of these. The first two are:

```
reject: wu yi
```

This prevents any word from having *wu* or *yi*. In reality, `reject:` is an
abbreviation, and that statement is equivalent to:

```
filter: wu > REJECT; yi > REJECT
```

As such, you can intersperse filters and rejections, and they will be performed
in order.

`filter:` and `reject:` use ECMAScript regular expressions. If you know what
that means, great; but if not, don't worry about it. The important things are:

- `^` matches the beginning of the word. `reject: ^a` would prevent a word from
starting with *a*.
- `$` matches the end of the word. `reject: a$` would prevent a word from
ending with *a*.
- `(a|b|c)` etc match multiple segments. The default phonology definition
prevents a word from having a voiceless plosive followed by *h* by rejecting
`(p|t|k|ʔ)h`.

If you want to prevent an entire part of a word from appearing twice in a row,
you can `reject: (..+)\1`. This would prevent e.g. *kiki* from being
generated, as it is just *ki* twice.

If you're confident that it is okay to simplify such occurrences, you may
instead `filter: (..+)\1+ > $1`. This would simplify *kiki* into simply *ki*.
This may not be desirable as it can make words that are significantly shorter
than expected.

## Cluster Fields

Cluster fields are a way to put a lot of related filters or rejections in a
smaller space. They are laid out like tables, and must start with `%`. For
example, a cluster field could look like:

```
% a  i  u
a +  +  o
i -  +  uu
u -  -  +
```

The first character is the row, and the second character is the column. In this
example, `au` becomes *o* and `iu` becomes *uu*. `+` means to leave the
combination as-is, and `-` means to reject it. This table would permit `ai` but
reject `ia`.

As with filters, these are parsed in the order presented. The cluster field
ends at a blank line.
