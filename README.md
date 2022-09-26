Check state of Proposal:

Open console: 
```
yarn hardhat console --network localhost
```

then:

```
const governor = await ethers.getContract('GovernorContract')
```

```
await governor.state("51508501457481436077634888669578781761098444908194579718864424217340756472817")
```